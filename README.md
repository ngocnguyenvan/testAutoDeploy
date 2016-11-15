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

├── server                     // all server side code
│   ├── middleware             // custom middleware
│   ├── routes                 // routes available to the application
│   │   └── api
│   │       └── 1.0            // api routes are grouped by version to enable support of multiple versions of the api
│   └── services               // business logic based upon area of focus
```
