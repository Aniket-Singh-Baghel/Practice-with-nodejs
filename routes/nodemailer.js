const nodemailer = require('nodemailer');
const {google} = require('googleapis');
const { text } = require('express');


const Redirect_Uri = 'https://developers.google.com/oauthplayground';
const Client_Id = `699128301871-9c8acocpajcc77l5obth3u83h9ie1tq2.apps.googleusercontent.com`;
const Client_Secret = "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";
const Refresh_Token = `1//04-_BMO68TnP7CgYIARAAGAQSNwF-L9IrN0-lcFlF9rS-KZWg-SX7lSn1FjtgQ5BhFzzGeNEZkaQLtxBAjyO-8njzmtWFEc3wos4`;

const oauthclient= new google.auth.OAuth2(Client_Id,Client_Secret,Redirect_Uri)

oauthclient.setCredentials({refresh_token:Refresh_Token})

async function sendMail(z,y){
  try{
    const at = await oauthclient.getAccessToken();
    const transport = nodemailer.createTransport({
      service:'gmail',
      auth:{
        type:'OAuth2',
        user:'as763829@gmail.com',
        clientId: Client_Id,
        clientSecret: Client_Secret,
        refreshToken: Refresh_Token,
        accessToken : at

      }
      
    })

    const mailOpts = {
      from :'ggsry43@gmail.com',
      to:'as763829@gmail.com', 
      subject:"jai ho",
      html:`<a href=${y}>Click Here</a>`,
    };

  
    const result = await transport.sendMail(mailOpts);
    return result;
  }
  catch (error){
    return error;
  }
}

module.exports = sendMail;