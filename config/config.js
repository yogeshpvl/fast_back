const config={


//customer send OTP
SEND_OTP:"https://kycuat.yappay.in/kyc/customer/generate/otp",

//Customer Registration  with OTP
CUSTOMER_REGISTER_WITH_OTP:"https://kycuat.yappay.in/kyc/v2/register",

//Vehicle Registration with vahan field
VAHAN_FIELDS:"https://uat-fleetdrive.m2pfintech.com/core/Yappay/registration-manager/v3/register?u",

//Check vehicle tag details - NETC level
CHECK_TAG_DETAILS:"https://uat-fleet-netcswitch.m2pfintech.com/web/requestDetail",

//Remove Unallocated Hotlist
REMOVE_UNALLOCATED_HOTLIST:"https://uat-fleetdrive.m2pfintech.com/core/Yappay/fleet-manager/UnregisteredNegativeList",

//uploadKyc
UPLOAD_KYC:"https://kycuat.yappay.in/kyc/uploadKyc",

//Fetch Tag Details
FETCH_TAG_DETAILS:"https://uat-fleetdrive.m2pfintech.com/core/Yappay/business-entity-manager/getTagList",

//Set Threshold Limit
SET_THRESHOLD_LIMIT:"https://uat-fleetdrive.m2pfintech.com/core/Yappay/fleet-manager/updateEntityDetails",

//Wallet Recharge
WALLET_RECHARGE:"https://uat-fleetdrive.m2pfintech.com/core/Yappay/txn-manager/create",

//Fetch User Balance
FETCH_USER_BALANCE:"https://uat-fleetdrive.m2pfintech.com/core/Yappay/business-entity-manager/fetchbalance/M2PPTEST",

//Fetch Transaction
FETCH_TRANSACTION:"https://sit-secure.yappay.in/Yappay/txn-manager/fetch/success/entity/M2PPTEST",

//Fetch txn by ext txn id
FETCH_TXN_BY_EXT_TXN_ID:"https://sit-secure.yappay.in/Yappay/txn-manager/fetch/LKGP_9775_0889",

//Change Tag status
CHANGE_TAG_STATUS:"https://uat-fleetdrive.m2pfintech.com/core/Yappay/fleet-manager/negativeList",

//Tag Replacement
TAG_REPLACEMENT:"https://uat-fleetdrive.m2pfintech.com/core/Yappay/business-entity-manager/replaceTag"

}


module.exports =config