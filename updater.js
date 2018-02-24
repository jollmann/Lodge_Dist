/**
 * Electron modules (npm)
 *
 * @return void
 */

const { autoUpdater } = require('electron-updater');
const { dialog, BrowserWindow, ipcMain } = require('electron');

/*
**  Enable logging
*/

autoUpdater.logger = require('electron-log');

/*
**  Set logger to log all events
*/

autoUpdater.logger.transports.file.level = 'info';

/*
**  Disable auto downloading
*/

autoUpdater.autoDownload = false;

/*
**  Check for updates
*/

exports.check = () => {

	// Set the feed url
	autoUpdater.setFeedURL('http://phpstack-152490-437947.cloudwaysapps.com/lodge');

	// Start update check
	autoUpdater.checkForUpdates();

	// Listen for download (update) found event
	autoUpdater.on('update-available', () => {

		// Track progress percent
		let downloadProgress = 0;

		// Prompt user to update
		dialog.showMessageBox({
			type: 'info',
			title: 'Update Available',
			message: 'A new version is available. Would you like to update now?',
			buttons: ['Update', 'No']
		}, (buttonIndex) => {

			// If not 'Update' button, return
			if(buttonIndex !== 0) return;

			// Else, start download and show download progress in new window
			autoUpdater.downloadUpdate();

			// Create progress window
			let progressWin = new BrowserWindow({
				width: 350,
				height: 35,
				useContentSize: true,
				autoHideMenuBar: true,
				maximizable: false,
				fullscreen: false,
				fullscreenable: false,
				resizable: false,
			});

			// Load the progress html
			progressWin.loadURL(`file://${__dirname}/views/general/progress.html`);

			// Handle the window close event
			progressWin.on('closed', () => {

				progressWin = null;

			});

			// Listen on the download-progress-request channel from renderer
			ipcMain.on('download-progress-request', (e) => {

				e.returnValue = downloadProgress;

			});

			// Track download progress on autoUpdater
			autoUpdater.on('download-progress', (d) => {

				downloadProgress = d.percent;

			});

			// Listen for completed update download
			autoUpdater.on('update-downloaded', () => {

				// Close progressWin
				if(progressWin) progressWin.close();

				// Prompt user to quit and install update
				dialog.showMessageBox({
					type: 'info',
					title: 'Update Ready',
					message: 'A new version of the Lodge is ready. Quit and install now?',
					buttons: ['Yes', 'Later']
				}, (buttonIndex) => {

					// Update if 'Yes'
					if(buttonIndex === 0) autoUpdater.quitAndInstall();

				});

			});

		});

	});

};