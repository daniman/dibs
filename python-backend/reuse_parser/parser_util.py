import unittest
import datetime
import re
from location_guesser import removeSignature

def isReplyEmail(email):
    #returns True if the email is a reply
    return email.subject.strip().lower().startswith("re:")
 
def splitEmailSender(sender):
    #sender in the form "julian contreras <jrcontre@mit.edu>"
    #split the sender into sender name, address
    sendrExp = sender.split("<")
    
    #no string or no discernable name
    if (len(sender) == 0 or len(sendrExp)<2):
        print "big error!",sender
        return ("","")
        
    senderName = sendrExp[0].strip()
    senderAddress = sendrExp[1].strip()[0:-1] #get rid of the last '>'
    
    #check that the name isn't weird
    if ( re.search(r"(\?)|(\d)|(\=)",senderName) != None):
        senderName = senderAddress
        
    return (senderName, senderAddress)
 
def getWaitTime():
    #determine the execution frequency based on the time of day
    now = datetime.datetime.now()
    hour = now.hour
    
    #8am - midnight -> primetime || else dead time
    if (hour >=8):
        #8am to midnight -> prime time
        if (hour >= 16 or hour <= 21 ):
            #from 4pm to 9pm is the fastest times
            return 5 #5 seconds
            
        else:
            return 90 #1.5 minutes
            
    else:
        #slow hours
        return 1800 #30 minutes
 
def replaceFooterText(text):
    blocLocation = text.find("___________")
    text = text[0:blocLocation]
    return text
    
def stripSubjectBoardType(text):
    return text.replace("[Reuse]","").strip()
  
def cleanUpEmail(email):
    #removes the signature
    email.body = removeSignature(email.fr, email.body)
    
    #removes the "to subscribe" message
    email.body = replaceFooterText(email.body)
    
    #remove the "[Reuse]" stuff
    email.subject = stripSubjectBoardType(email.subject)  
    
def isClaimedEmail(email):
    text = (email.subject+" "+email.body) .lower()

    claim_obj = re.search(r"((claim)(ed)?)|(gone)|(taken)",text)
    return claim_obj != None
    
class dummyEmail(object):
    #a fake email object that stores attributes
    def __init__(self):
        self.body = ""
        self.subject = ""
        self.fr= ""
        self.sender=""
        
        
        
class LocationGuess_methods_Tests(unittest.TestCase):
    
    def setUp(self):
        self.sender = "julian contreras <jrcontre@mit.edu>"
        print "\nIn method", self._testMethodName 
        
    def test_splitSender(self):
        result = splitEmailSender("julian contreras <jrcontre@mit.edu>")
        self.assertEquals(result[0],"julian contreras")
        self.assertEquals(result[1],"jrcontre@mit.edu")
        
    def test_isReplyEmail(self):
        d = dummyEmail()
        d.subject = "Re: hello!"
        result = isReplyEmail(d)
        self.assertEquals(result,True)
        
        d.subject = "hello!"
        result = isReplyEmail(d)
        self.assertEquals(result,False)
     
    def test_footer_1(self):
        body = "i am a test_______________________________________________To sub/unsubscribe or to see the list rules:  http://mailman.mit.edu/mailman/listinfo/reuse"
        
        result = replaceFooterText(body)
        self.assertEquals(result,"i am a test")        
        
        body = "i am a test\r\n_______________________________________________\r\nTo sub/unsubscribe or to see the list rules:  http://mailman.mit.edu/mailman/listinfo/reuse"
        
        result = replaceFooterText(body)
        self.assertEquals(result,"i am a test\r\n")
    
    def test_BoardTypeReplace(self):
        result = stripSubjectBoardType("[Reuse] the subject")
        self.assertEquals(result.find("[Reuse]"), -1)
        
    def test_getWaitTime(self):
        wait4it = getWaitTime()
       
    def testSplitSender_badName(self):
        result = splitEmailSender("juli?an co=43ntreras <jrcontre@mit.edu>")
        self.assertEquals(result[0],"jrcontre@mit.edu")
        self.assertEquals(result[1],"jrcontre@mit.edu")
                
        result = splitEmailSender("julian co=ntreras <jrcontre@mit.edu>")
        self.assertEquals(result[0],"jrcontre@mit.edu")
        self.assertEquals(result[1],"jrcontre@mit.edu")
        
    def test_cleanUpEmail(self):
        d = dummyEmail()
        d.subject = "[Reuse] hello!"
        d.body = "hello there, we are the _________________"
        d.fr = "Julian contreras <jrcontre@mit.edu>"
        cleanUpEmail(d)

        self.assertEquals(d.subject, "hello!")
        self.assertEquals(d.body, "hello there, we are the ")

    def test_isClaimed_basic_body(self):
        d = dummyEmail()
        d.subject = "[Reuse] hello!"
        d.body = "the bag is taken"
        
        self.assertEquals(isClaimedEmail(d), True)        
        
        d.subject = "[Reuse] hello!"
        d.body = "the bag is gone"
        
        self.assertEquals(isClaimedEmail(d), True)        
        
        d.subject = "[Reuse] hello!"
        d.body = "the bag is claimed"
        
        self.assertEquals(isClaimedEmail(d), True)
        
    def test_isClaimed_basic_subject(self):
        d = dummyEmail()
        d.subject = "[Reuse] hello! the couch is gone"
        d.body = "no word on the umbrella though"
        
        self.assertEquals(isClaimedEmail(d), True)             
        
        d.subject = "[Reuse] hello! the couch is claim"
        d.body = "no word on the umbrella though"
        
        self.assertEquals(isClaimedEmail(d), True)           
        
        d.subject = "[Reuse] hello! the couch is"
        d.body = "The Display has been claimed."
        
        self.assertEquals(isClaimedEmail(d), True)      

    def test_isClaimed_basic_not_claimed(self):
        d = dummyEmail()
        d.subject = "[Reuse] hello! the couch is great"
        d.body = "juicy j is coming too"
        
        self.assertEquals(isClaimedEmail(d), False)             
        
if __name__=="__main__":
    #run tests
    unittest.main()
    
else:
    #imported
    pass