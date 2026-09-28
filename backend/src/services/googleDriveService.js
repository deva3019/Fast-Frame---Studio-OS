const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.GDRIVE_CLIENT_EMAIL,
        private_key: process.env.GDRIVE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive'], 
});

const drive = google.drive({ version: 'v3', auth });

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const fetchPaginatedImages = async (folderId, pageToken = null) => {
    try {
        const response = await drive.files.list({
            q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
            pageSize: 50,
            pageToken: pageToken,
            fields: 'nextPageToken, files(id, name, thumbnailLink)',
            orderBy: 'name',
            supportsAllDrives: true,
            includeItemsFromAllDrives: true
        });

        const files = response.data.files || [];
        const next_page_token = response.data.nextPageToken || null;

        const images = files.map(f => {
            // STRICT MATCH TO OLD PYTHON LOGIC: Replace =s220 with =s800[cite: 3]
            let fastThumbnail = f.thumbnailLink ? f.thumbnailLink.replace('=s220', '=s800') : '';
            
            // Fallback just in case the CDN link isn't generated yet[cite: 3]
            if (!fastThumbnail) {
                fastThumbnail = `https://drive.google.com/uc?id=${f.id}`;
            }

            return {
                id: f.id,
                name: f.name,
                thumbnail: fastThumbnail,
                full: `https://drive.google.com/uc?export=view&id=${f.id}`
            };
        });

        return { images, next_page_token };
    } catch (error) {
        console.error("Drive API Fetch Error:", error.message);
        throw new Error("Failed to fetch images from Drive.");
    }
};

const createShortcutsForSelections = async ({
    targetFolderId,
    clientName,
    folders = [],
    selectionsByFolder = {},
    selectedImageIds = [],
    onProgress = () => {}
}) => {
    let rootFolderId = null;

    try {
        await onProgress("Initializing root directory...");
        const cleanClientName = (clientName || 'Client').replace(/[/\\?%*:|"<>]/g, '-').trim();
        const rootFolderRes = await drive.files.create({
            resource: {
                name: `${cleanClientName} - Final Selections`,
                mimeType: 'application/vnd.google-apps.folder',
                parents: [targetFolderId]
            },
            fields: 'id, webViewLink',
            supportsAllDrives: true
        });

        rootFolderId = rootFolderRes.data.id;
        const rootFolderLink = rootFolderRes.data.webViewLink;

        let mapping = {};
        if (selectionsByFolder instanceof Map) mapping = Object.fromEntries(selectionsByFolder);
        else if (typeof selectionsByFolder === 'object' && selectionsByFolder !== null) mapping = { ...selectionsByFolder };

        const hasFolderMapping = Object.keys(mapping).some(k => (mapping[k] || []).length > 0);
        if (!hasFolderMapping && selectedImageIds.length > 0) mapping['root'] = selectedImageIds;

        for (const folder of folders) {
            const folderId = folder.driveFolderId;
            const fileIds = mapping[folderId] || [];

            if (fileIds.length === 0) continue;

            await onProgress(`Creating subfolder: ${folder.name}...`);
            const subfolderRes = await drive.files.create({
                resource: {
                    name: folder.name,
                    mimeType: 'application/vnd.google-apps.folder',
                    parents: [rootFolderId]
                },
                fields: 'id',
                supportsAllDrives: true
            });
            const subfolderId = subfolderRes.data.id;

            let count = 0;
            for (const fileId of fileIds) {
                count++;
                if (count % 5 === 0) await onProgress(`Mapping ${folder.name}: ${count} of ${fileIds.length}...`);
                
                await drive.files.create({
                    resource: {
                        name: `Selected_${fileId}`,
                        mimeType: 'application/vnd.google-apps.shortcut',
                        shortcutDetails: { targetId: fileId },
                        parents: [subfolderId]
                    },
                    supportsAllDrives: true
                });
                await delay(150); 
            }
        }

        if (mapping['root'] && mapping['root'].length > 0) {
            let count = 0;
            for (const fileId of mapping['root']) {
                count++;
                if (count % 5 === 0) await onProgress(`Mapping General: ${count} of ${mapping['root'].length}...`);
                
                await drive.files.create({
                    resource: {
                        name: `Selected_${fileId}`,
                        mimeType: 'application/vnd.google-apps.shortcut',
                        shortcutDetails: { targetId: fileId },
                        parents: [rootFolderId]
                    },
                    supportsAllDrives: true
                });
                await delay(150); 
            }
        }

        await onProgress("Sync complete!");
        return { success: true, folderLink: rootFolderLink, rootFolderId };

    } catch (error) {
        console.error("Shortcut Creation Error:", error.message);
        if (rootFolderId) {
            try {
                await onProgress("Error encountered. Rolling back folders...");
                await drive.files.delete({ fileId: rootFolderId, supportsAllDrives: true });
            } catch (e) {}
        }
        throw new Error(error.message);
    }
};

module.exports = { fetchPaginatedImages, createShortcutsForSelections };