# Thousand Stars - Admin Portal

<img src="./resources/thousand-stars.jpg" width="200" alt="Tree of a Thousand Stars, Serissa foetida, Snow Rose, Japanese Boxthorn" />

The following core packages are utilized:

 -  [react](http://facebook.github.io/react/)
 -  [express](https://github.com/strongloop/express)
 -  [webpack](http://webpack.github.io/)
 -  [react-router](https://github.com/rackt/react-router)
 -  [react-hot-loader](https://github.com/gaearon/react-hot-loader)


See the `package.json` for more details.


### Running in development mode

 -  `npm install`
 -  `npm run dev`

Access the main URL via: [http://localhost:7811/](http://localhost:7811/)


### Deploying to Production

    npm run build && \
    npm run build-production && \
    npm install && \
    npm run deploy-production

### Deploying to Staging

    npm run build && \
    npm run build-staging && \
    npm install  && \
    npm run deploy-staging

### Deploying to PRE-Production

    npm run build && \
    npm run build-production && \
    npm install  && \
    npm run deploy-pre-prod


### File Structure

```
├── app:            root of the react application.
│   ├── actions:    react/flux actions
│   ├── assets:     static assets
│   ├── components  repo specific re-usable components
│   │   └──
│   ├── path        routes presented in the react app.  Each path managing its unique assets, paths and components.
│   ├── stores      flux stores
│   └── utils       repo utilities
├── build           static items built by webpack
├── config          environment configuration
├── json            static JSON files for dev
├── production      scripts for setting up production
├── resources       resources relating to the application ( diagrams, mocks, etc. )
├── server          node app for rendering the application
│   ├── models      db models
│   └── routes      server API routes
├── services        node services - specific business logic or purpose scripts
└── webpack         webpack configuration and initialization
```
