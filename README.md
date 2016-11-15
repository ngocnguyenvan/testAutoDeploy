# testAutoDeploy
```
├── app                        
│   ├── actions  
        ├── adminCustomSearchCreators.js                        // Contains methods modified custom search for admin
            ├── adminSaveCustomSearch()       
            ├── adminNewSearch()  
            ├── resetCustomSearch()  
            ├── updateCustomSearch()  
            ├── savePartyCustomSearch()  
            ├── adminUpdateListSaveSearch()  
            ├── adminUpdateSaveSearch()  
            ├── adminResetAllSearch()  
        ├── applicationActionCreators.js                        // check and load the existing session
            ├── initApplication()                               
        ├── authActionCreators.js                               // Contains methods modified login and register
            ├── login()                                         // call action login 
            ├── loginSuccess() 
            ├── loginFailed() 
            ├── logout()                                        // call action logout      
            ├── logoutSuccess() 
            ├── logoutFailed() 
            ├── registerUser() 
            ├── registerUserFailed()                                  
        ├── leadPushNotiActionCreators.js                       // Contains methods send mail to Lead.
            ├── saveSearch()   
            ├── changeStep()   
            ├── saveSelectListing()   
            ├── saveEmail()   
            ├── saveBody()   
            ├── saveSubject()   
            ├── createNewPushNotification()   
            ├── resetPushNotification()   
            ├── updateSavedListDetail()   
            ├── updateSaveList()   
            ├── updateLeadId()   
            ├── updateListSentViewing()   
        ├── userActionCreators.js                               // Contains methods relating to update user
            ├── updateUser()  
            ├── updateUserSuccess()  
            ├── updateUserFailed()  
    ├── assets                 // shared assets (images, styles)
│   ├── components             // grouped components based upon focus
    |   ├── core                  // Contains components core: ex Button, Checkbox, Block, Table....                     
    |       ├── Button            // Component Button
    |            ├── index.jsx    // the main component JSX file
    |            ├── style.less   // less styles which will be compiled at deploy time.
    |       ...
    |   ├── input                 // Contains components input: FormFields, FormFieldsMaterial 
    |       ├── FormFields
    |           ├── index.jsx      
    |           ├── style.less
    |       ...
    |   ├── lead                  // Contains components for Lead: LeadMail, LeadPushNoti, LeadSendMail...
    |       ├── LeadActivity
    |           ├── index.jsx
    |           ├── style.less
    |       ...
    |   ├── listings              // Contains components searching result.
    |       ├── listingsItem
    |           ├── index.jsx
    |           ├── style.less
    |       ...
│   ├── pages or path           // root "pages" based upon the routing of the application. [TODO] needs more structure                
        ├── ylopoUI
        
│   ├── stores                 // flux stores
│   └── utils     
├── server                     // all server side code
│   ├── middleware             // custom middleware
│   ├── routes                 // routes available to the application
│   │   └── api
│   │       └── 1.0            // api routes are grouped by version to enable support of multiple versions of the api
│   └── services               // business logic based upon area of focus
```
