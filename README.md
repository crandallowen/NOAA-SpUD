# NOAA SpUD #
A database used to track the spectrum usage of NOAA for the purpose of spectrum management.

# dist
A folder that contains static assets which are ready to be served by the backend server.

## assets
A folder containing all assets served by the backend server, including .css files, .js files compiled from .vue files, the favicon, NOAA logo in .svg format, and .QRY files.

## src\html
A folder that contains the index.html file that serves as the entrypoint of the web application. Folder format is an artifact of source folder organization.

# src
A folder containing all source files used to build the application.

## assets
A folder containing static assets to be bundled into the dist folder after build, including site-level .css files, the favicon, .QRY files that can be downloaded by users, and the NOAA logo in .svg format

## components
A folder containing reusable components made using the Vue framework in .vue format.

## html
A folder containing the index.html file which acts as the entrypoint of the application.

## js
A folder containing JavaScript files that have utility functions, including api.js which defines functions used to make API requests to the backend server, fetch.js which wraps the fetch API, and utils.js which defines useful functions and constants that are used by multiple views and components.

## router
A folder containing files used by the Vue Router to handle client-side routing and implement navigation guards for protected routes.

## sql
A folder containing SQL files that are used to create the necessary tables and delete data from those tables.

## stores
A folder that contains .js files that define the Pinia stores used in this application

## views
A folder containing .vue files that define the different pages of the site.

## App.vue
The .vue file that wraps the SPA and defines the structure of the application.

## main.js
The script referenced in index.html that creates the application using the definition found in App.vue.

# .env
An encrypted environment variable file with environment variables used in both development and production.

# .env.development
An encrypted environment variable file with environment variables used in development.

# .env.production
An encrypted environment variable file with environment variables used in production.

# Dockerfile
A file that defines the build process for the container image of the application.

# jsconfig.js
A file that is used by VSCode to properly read include statements.

# package.json
A file containing information on the application, including name, version, maintainer, npm scripts, and dependencies.

# server.js
The backend server script that defines the routes, PassportJS strategy, and session configuration.

# upload.py
A python script that takes user upload files from the backend server and updates the database from the data therein.

# vite.config.js
A file used by the Vite builder to properly compile that application and build for production.