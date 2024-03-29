#base modules
import time
import datetime
import sys, os #for restarting this program
import traceback

#ported modules
from gmail import Gmail # https://github.com/charlierguo/gmail
from parse_rest.datatypes import Object, GeoPoint # https://github.com/dgrtwo/ParsePy
from parse_rest.connection import register, ParseBatcher

#self written
from location_guesser import LocationGuesser as Locator
import send_log_email as emailer
import parser_util as util

#SCRAPPED: amazon python sdk http://aws.amazon.com/sdkforpython/
#DONE: only 1 entry per thread id. only add if a location was found and the previous entry wasn't present!
#DONE: include geopoint object per each reuse item!

#make each session unique in the log emails
subject = '[reuse parser] LOG MESSAGE '+time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime())  
 
def restart_program():
    """Restarts the current program.
    Note: this function does not return. Any cleanup action (like
    saving data) must be done before calling this function."""
    python = sys.executable
    os.execl(python, python, * sys.argv)

def sendLogEmail(body):
    print("attempted to email ",body,subject)
    emailer.sendEmail(body,subject)    
        
def registerAppWithParse():
    parseAppId = "KxXRF1qcFjHqA2AKnyPvg5Ys2VzMWR2ViAKNtX8V"
    parseRestApiKey = "ES02u7gPWXSmOshD1Lwo2yhxjj4j0fxbcqdTUSBE"
    
    # register(<application_id>, <rest_api_key>[, master_key=None])
    register(parseAppId, parseRestApiKey)
 
def isReplyEmail(email):
    #returns true if the email is a reply
    return email.subject.strip().lower().startswith("re:")
    
class TestReuseItem_rev5(Object):
    pass
    
class ReuseItem(Object):
    pass
 
class BuildingData(Object):
    pass

    

class ReuseParser(object):
    #something profound should go here as a comment
    #EDIT: FOUND IT!!! http://reggaehorn.com/
    
    def __init__(self):
        #DRY init
        self.isDebugMode= False
        
        self.logStore = ""
        self.logNumLines=0
        self.logSnippetLength = 32
        self.logMaxLength = 512
        
        self.buildingLocationDict = {} 
        
        # #the gmail object, maybe
        # self.g = Gmail()
        # self.g.login("radixdeveloper", "whereisstrauss")
        
        #the location object
        self.loc = Locator()
        
        #WET AND NASTY init
        self.storeBuildingLocations()
        print 'init completed'
        self.appendToLog('init completed')
       
    def storeBuildingLocations(self):
        #queries the list of building locations from parse and stores them for faster lookup.
        print 'creating building lookup table'
        self.appendToLog('creating building lookup table')
        allBuildingLocations = BuildingData.Query.all().limit(500)
        for building in allBuildingLocations:
            name = building.buildingName
            gps_lng = float(building.gps_lng)
            gps_lat = float(building.gps_lat)
            self.buildingLocationDict[name]=(gps_lat,gps_lng)
            if self.isDebugMode: 
                print name, self.buildingLocationDict[name]

    def getGpsLocation(self, someGuess):
        #given a location, return a geopoint object if stored in the lookup table, else 
        #returns None
        if someGuess.foundLocation and self.buildingLocationDict.has_key(someGuess.generalLocation):
            (gps_lat,gps_lng) = self.buildingLocationDict[someGuess.generalLocation]
            return GeoPoint(latitude=gps_lat, longitude=gps_lng)
   
    def appendToLog(self, message):
        #get the timestamp
        
        # now = time.strftime("%c")
        now = datetime.datetime.now()
        ## date and time representation
        
        #append to the log
        self.logStore += "%s\n============ {%s}\n" % (message, now)
        self.logNumLines+=1
        
        #dump the log to the guy writing this... maybe
        if (self.logNumLines > self.logMaxLength):
            sendLogEmail(self.logStore)
            
            self.logNumLines= 0
            self.logStore = ""
        
    def createReuseItem(self,email,guess):
        #standardizes how the reuse item class should look
           
        util.cleanUpEmail(email)
        
        sent_timestamp = time.mktime(email.sent_at.timetuple())
        (senderName, senderAddress) = util.splitEmailSender(email.fr)
        
        #parcel the object
        theReuseItem = ReuseItem(email_id= email.thread_id, 
        email_body= email.body, 
        email_senderName = senderName,
        email_senderAddress = senderAddress,
        # email_sender= email.fr,
        email_subject= email.subject, 
        email_timestamp_unix= sent_timestamp, #and the timestamp
        email_datetime= str(email.sent_at),
        
        item_location_general= guess.generalLocation, #the location of the guess
        item_location_specific= guess.specificLocation, #the location of the guess
        guess_found= guess.foundLocation, #did the parser actually find anything 
        guess_last_resort = guess.lastResort, #how desperate was the guess?!
        
        keywords=[], #frontend data
        
        claimed= False,
        claimed_by= "",

        uniqueViewers= 0)
        
        if (guess.foundLocation):
            somePoint = self.getGpsLocation(guess)
            if somePoint is not None:
                #set the geopoint if we know where it is!
                theReuseItem.gps_location = GeoPoint(latitude= somePoint.latitude, longitude= somePoint.longitude)
            else:
                print "could not find location _%s_ in lookup dict" % guess.generalLocation
                self.appendToLog("could not find location _%s_ in lookup dict" % guess.generalLocation)
                theReuseItem.guess_found=False
                
        return theReuseItem
        
    def batchSaveList(self, listOfParseObjects):
        if len(listOfParseObjects)==0:
            return;
            
        print 'batch saving objects'
        self.appendToLog('batch saving %d objects' % len(listOfParseObjects))
        
        #batch save a list of parseobjects. the batch limit is 50!
        batcher = ParseBatcher()
        batchLimit = 50
        while len(listOfParseObjects)> 0:
            #save the first @batchLimit amount of objects
            batcher.batch_save(listOfParseObjects[0:batchLimit])
            
            #clear the list of those saved objects
            listOfParseObjects = listOfParseObjects[batchLimit:]
    
    def handleReplyEmail(self, replyList):
        batchItemList = []
        
        for email in replyList:
            #find the old post and set the claimed field!
            existingItems= ReuseItem.Query.all().filter(email_id = email.thread_id).limit(1) #get only 1 post
            
            for item in existingItems:
                #update the claimed field
                item.claimed = True
                batchItemList.append(item)
                logPost = "set post _%s_ to claimed based on post _%s_" % (item.email_subject[0:32], email.body[0:32])
                self.appendToLog( logPost )
                if self.isDebugMode: print logPost
            
        #batch save those objects now!
        self.batchSaveList(batchItemList)
            
    def yesItShould(self):
        #runs the whole shebang
        self.appendToLog(" ")
        self.appendToLog("running the whole shebang")
         
        # #the gmail object, maybe
        # g = Gmail()
        self.g = Gmail()
        self.g.login("radixdeveloper", "whereisstrauss")

        # #the location object
        # loc = Locator()

        emails = self.g.label("reuse").mail(unread=True)
        
        #batcher lists for parse
        parseObjectBatchList = []
        # claimedEmailsBatchList = []
        
        for email in emails:
            if self.isDebugMode: 
                print "="*8
                print " "
                
            email.fetch()

            #don't read if testing
            if not self.isDebugMode: email.read()

            #if it is a reply email, ignore it
            if isReplyEmail(email):
                if self.isDebugMode: print "skipping: "+email.subject #+ " "+email.body
                
                # if (util.isClaimedEmail(email)):
                    # claimedEmailsBatchList.append(email)
                continue

            #print the first snippet of the email
            print(email.subject[0:self.logSnippetLength])   
            # print(email.body)   
            self.appendToLog(email.subject[0:self.logSnippetLength])      

            #make the guess
            locationGuess = self.loc.makeGuessByEmail(email)
            self.appendToLog("guess location = %s" % locationGuess.__str__())     
            if self.isDebugMode: print("guess location = %s" % locationGuess.__str__()) 
            
            #create the item and save for later batch saving
            theReuseItem = self.createReuseItem(email,locationGuess)
            parseObjectBatchList.append(theReuseItem)
        
        #batch save the objects we created above 
        self.batchSaveList(parseObjectBatchList)
          
        # #deal with the reply emails AFTER saving the existing ones above
        # self.handleReplyEmail(claimedEmailsBatchList)

        print 'done'
        self.appendToLog("done with run, logging out of gmail.")
        self.g.logout()

if (__name__ == "__main__"):
    #we're running!
    # runTest()
    print("running")
    registerAppWithParse()
    ShouldItRun = ReuseParser()
    try:   
        while (True):
            ShouldItRun.yesItShould()
            if (ShouldItRun.isDebugMode):
                break; #break for debug
              
            print("waiting")
            time.sleep(util.getWaitTime()) #wait some time 
            
    except Exception, e:
        #dump the log!
        if (len(ShouldItRun.logStore)>0):
            sendLogEmail(ShouldItRun.logStore)
            
        #email the error itself
        ex = traceback.format_exc()
        sendLogEmail("reuse parser has crashed. restarting.  \n"+e.message+"\n"+ex)
        print("error!",e.message)
        restart_program()
    
else:
    #we've been imported!
    pass
    

#useful stuff!    
# dir(email) from g.inbox().mail()
# ['__doc__', '__init__', '__module__', 'add_label', 'archive', 'body', 'cc', 'delete', 'delivered_to', 
# 'fetch', 'fetch_thread', 'flags', 'fr', 'gmail', 'has_label', 'headers', 'is_deleted', 'is_draft', 
# 'is_read', 'is_starred', 'labels', 'mailbox', 'message', 'message_id', 'move_to', 'parse', 'parse_flags', 
# 'parse_headers', 'parse_labels', 'read', 'remove_label', 'sent_at', 'star', 'subject', 'thread', 'thread_id', 
# 'to', 'uid', 'unread', 'unstar']

#string "like" ratio http://stackoverflow.com/questions/10849141/can-i-do-a-string-contains-x-with-a-percentage-accuracy-in-python

# emails = g.inbox().mail()
# emails = g.label("reuse").mail(unread=True,prefetch=True)

#backend timestamp bug!
# /usr/local/lib/python2.7/dist-packages/gmail

# sent_at2 = email.utils.mktime_tz(email.utils.parsedate_tz(  self.message['date']) )
# self.sent_at = datetime.datetime.fromtimestamp(sent_at2)

#gmail pip install location!
#/usr/local/lib/python2.7/dist-packages$ 