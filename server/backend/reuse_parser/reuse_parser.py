#base modules
import time
import datetime
import sys, os #for restarting this program

#ported modules
from gmail import Gmail # https://github.com/charlierguo/gmail
from parse_rest.datatypes import Object, GeoPoint # https://github.com/dgrtwo/ParsePy
from parse_rest.connection import register, ParseBatcher

#self written
from location_guesser import LocationGuesser as Locator
import send_log_email as emailer

#TODO: amazon python sdk http://aws.amazon.com/sdkforpython/

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
    
def runTest():
    pass #needs to be re implemented!
    #the gmail object
    g = Gmail()
    g.login("radixdeveloper", "whereisstrauss")
    
    #the location object
    loc = Locator()
   

    emails = g.label("reuse").mail(prefetch=True)
    # email0 = emails[0]
    # print email0.thread_id
    # print email0.sent_at,type(email0.sent_at)
    for email in emails:
        if email.thread_id=="1456766328446676971": #testing id
            print email.uid
            print email.message_id
            print email.body[0:32] #just a snippet
            print " "
        # emails[0].fetch()
        # location = loc.makeGuessByEmail(email)
        # if location is None:
            # counter+=1
            # print email.body
            # print 'SUBJECT====>',email.subject
            # print 'SENDER====>',email.fr
            
            # print 'LOCATION====>',location
            # print "="*40
            # print "\n"*5

    g.logout()
    
class TestReuseItem_rev4(Object):
    pass
    
class ReuseItem(Object):
    pass
 
class BuildingData(Object):
    pass

class ReuseParser(object):
    #something profound should go here as a comment
    
    def __init__(self):
        #DRY init
        self.isDebugMode= False
        
        self.logStore = ""
        self.logNumLines=0
        
        self.buildingLocationDict = {} 
        
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
    
    def isReplyEmail(self,email):
        #returns true if the email is a reply
        return email.subject.strip().lower().startswith("re:")
        
    def appendToLog(self, message):
        #get the timestamp
        
        # now = time.strftime("%c")
        now = datetime.datetime.now()
        ## date and time representation
        
        #append to the log
        self.logStore += "%s<br>============ {%s}<br>" % (message, now)
        self.logNumLines+=1
        
        #dump the log to the guy writing this... maybe
        if (self.logNumLines > 512):
            sendLogEmail(self.logStore)
            
            self.logNumLines= 0
            self.logStore = ""
        
    def createReuseItem(self,email,guess):
        #standardizes how the reuse item class should look

        sent_timestamp = time.mktime(email.sent_at.timetuple())
        
        #parcel the object
        theReuseItem = ReuseItem(email_id= email.thread_id,
        email_body= email.body, 
        email_sender= email.fr,
        email_subject= email.subject, 
        
        item_location_general= guess.generalLocation, #the location of the guess
        item_location_specific= guess.specificLocation, #the location of the guess
        guess_found= guess.foundLocation, #did the parser actually find anything 
        
        keywords=[], #frontend data
        uniqueViewers= 0,
        claimed= False,
        claimed_by= "",
        
        email_timestamp_unix= sent_timestamp) #and the timestamp
        
        if (guess.foundLocation):
            somePoint = self.getGpsLocation(guess)
            if somePoint is not None:
                #set the geopoint if we know where it is!
                theReuseItem.gps_location = GeoPoint(latitude= somePoint.latitude, longitude= somePoint.longitude)
            else:
                print "could not find location _%s_ in lookup dict" % guess.generalLocation
                self.appendToLog("could not find location _%s_ in lookup dict" % guess.generalLocation)
                
        return theReuseItem
        
    def batchSaveList(self, listOfParseObjects):
        print 'batch saving objects'
        self.appendToLog('batch saving %d objects' % len(listOfParseObjects))
        if (self.isDebugMode):
            print 'debug mode is on, not saving these objects'
        
        #batch save a list of parseobjects. the batch limit is 50!
        batcher = ParseBatcher()
        batchLimit = 50
        while len(listOfParseObjects)> 0:
            #save the first @batchLimit amount of objects
            batcher.batch_save(listOfParseObjects[0:batchLimit])
            
            #clear the list of those saved objects
            listOfParseObjects = listOfParseObjects[batchLimit:]
        
    def yesItShould(self):
        #runs the whole shebang
        self.appendToLog("running the whole shebang")
        
        #the gmail object, maybe
        g = Gmail()
        g.login("radixdeveloper", "whereisstrauss")

        #the location object
        loc = Locator()

        emails = g.label("reuse").mail(unread=True)
        # emails = g.label("reuse").mail(prefetch=True)
        
        #batcher list for parse
        parseObjectBatchList = []
        logCounter= 0
        for email in emails:
            email.fetch()
            logCounter+=1
            if (logCounter %25)==0:
                print 'read 25 new emails'
                self.appendToLog('read 25 new emails')
                
            email.read()

            if self.isReplyEmail(email):
                if self.isDebugMode: print "skipping"
                continue

            #print the first snippet of the email
            print(email.subject[0:32])   
            self.appendToLog(email.subject[0:32])            
            locationGuess = loc.makeGuessByEmail(email)
            self.appendToLog("guess location = %s" % locationGuess.__str__())     
            
            theReuseItem = self.createReuseItem(email,locationGuess)
            parseObjectBatchList.append(theReuseItem)
        
        #batch save the objects we created above
        self.batchSaveList(parseObjectBatchList)

        print 'done'
        self.appendToLog("done with run, logging out of gmail.")
        g.logout()

if (__name__ == "__main__"):
    #we're running!
    # runTest()
    print("running")
    registerAppWithParse()
    ShouldItRun = ReuseParser()
    try:   
        while (True):
            ShouldItRun.yesItShould()
            time.sleep(300) #wait 5 minutes  
    except Exception, e:
        #dump the log!
        if (len(ShouldItRun.logStore)>0):
            sendLogEmail(ShouldItRun.logStore)
            
        sendLogEmail("reuse parser has crashed. restarting. <br><br>"+e.message)
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