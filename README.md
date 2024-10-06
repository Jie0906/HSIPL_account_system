# HSIPL Account System v1.0.0

![Express Version](https://img.shields.io/badge/Express-4.17.1-green.svg)
![Redis Version](https://img.shields.io/badge/Redis-%5E4.6.13-red.svg)
![Sequelize Version](https://img.shields.io/badge/Sequelize-%5E6.15.0-yellow.svg)
![Docker Version](https://img.shields.io/badge/Docker-24.0.2-blue.svg)

## Description

This account system is for the Lab HSIPL at NYUST. It assists lab members with member login, recording expenses, and fund transfers.

## Data Structure

```plaintext
.
├── Dockerfile
├── README.md
├── app.js
├── config
│   ├── auth.config.js
│   ├── database.config.js
│   ├── mail.config.js
│   ├── passport.js
│   └── redisClient.config.js
├── controllers
│   ├── Fund
│   │   ├── fundCategoryController.js
│   │   └── fundTransferController.js
│   ├── User
│   │   ├── permissionController.js
│   │   ├── roleController.js
│   │   ├── rolePermissonController.js
│   │   └── userRoleController.js
│   ├── fundController.js
│   ├── profileController.js
│   ├── publicController.js
│   └── userController.js
├── docker-compose.yml
├── middleware
│   ├── checkPermission.js
│   ├── deleteFile.js
│   ├── errorHandler.js
│   ├── imageUpload.js
│   ├── sessionIdController.js
│   └── tokenController.js
├── models
│   ├── Fund
│   │   ├── FundLogModel.js
│   │   ├── FundModel.js
│   │   ├── FundTransferModel.js
│   │   └── LabBalanceModel.js
│   ├── User
│   │   ├── PermissionModel.js
│   │   ├── ResetPasswordTokenModel.js
│   │   ├── RoleModel.js
│   │   ├── RolePermissionModel.js
│   │   ├── UserBalanceModel.js
│   │   ├── UserModel.js
│   │   └── UserRoleModel.js
│   └── index.js
├── package-lock.json
├── package.json
├── redis.conf
├── routes
│   ├── authRoute.js
│   ├── fund
│   │   ├── fundCategoryRoute.js
│   │   └── fundTransferRoute.js
│   ├── fundRoute.js
│   ├── profileRoute.js
│   ├── publicRoute.js
│   ├── user
│   │   ├── permissionRoute.js
│   │   ├── rolePermissionRoute.js
│   │   ├── roleRoute.js
│   │   └── userRoleRoute.js
│   └── userRoute.js
├── seeders
│   └── 20241004234750-init-admin-roles-permissions.js
├── server.js
├── structure.txt
├── tests
│   └── controllers
│       ├── fund
│       │   ├── addItem.test.js
│       │   ├── deleteItem.test.js
│       │   ├── getAllItem.test.js
│       │   ├── getItemById.test.js
│       │   ├── restoreItem.test.js
│       │   ├── searchItem.test.js
│       │   └── updateItem.test.js
│       ├── fundTransfer
│       │   └── fundTransfer.test.js
│       └── user
│           ├── createUser.test.js
│           ├── deleteUser.test.js
│           ├── findUser.test.js
│           ├── forgetPassword.test.js
│           ├── login.test.js
│           ├── logout.test.js
│           ├── resetPassword.test.js
│           └── restoreUser.test.js
├── utils
│   ├── balanceUtils.js
│   ├── countTotalAmount.js
│   ├── encryptPassword.js
│   ├── fundLogUtils.js
│   ├── seedRunner.js
│   └── sessionUtils.js
└── yarn.lock

```

## Installing & Usage

### .env Settings

#### Keys

- `JWT_SECRET`: 
- `SESSION_SECRET`: 

#### Nodemailer 

- `MAIL_USER`
- `MAIL_PASSWORD`

#### Sequelize Connection 

- `DB_HOST`
- `DB_USER`
- `DB_PASSWORD`
- `DB_DB`

#### Redis Connection 
- `REDIS_HOST`
- `REDIS_PORT`

#### Google Oauth 
- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRECT`
- `GOOGLE_OAUTH_CALLBACK`

### Download the Project

```git clone https://github.com/Jie0906/HSIPL_account_system.git```

### Install Dependencies

```npm install```


### Run on Localhost

```npm run dev```





