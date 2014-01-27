#!/usr/bin/python
import smtplib
 
SMTP_SERVER = 'smtp.gmail.com'
SMTP_PORT = 587
 
sender = 'radixdeveloper@gmail.com'
recipient = 'julian.r.contreras@gmail.com'

def sendEmail(body="no body woops",subject="hello"):  
    body = "" + body + ""
     
    headers = ["From: " + sender,
               "Subject: " + subject,
               "To: " + recipient,
               "MIME-Version: 1.0",
               "Content-Type: text/plain"]
    headers = "\r\n".join(headers)
     
    session = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
      
    session.ehlo()
    session.starttls()
    session.ehlo
    session.login(sender, "whereisstrauss")
     
    session.sendmail(sender, recipient, headers + "\r\n\r\n" + body)
    session.quit()   

if __name__ == "__main__":
    #this program is being run directly, run some main()
    sendEmail("testing\nI am a test\n\nNewlines are cool")
else:   
    #this program is being imported
    pass