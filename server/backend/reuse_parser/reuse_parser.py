#base modules
import time
import datetime

#ported modules
from gmail import Gmail #https://github.com/charlierguo/gmail
from parse_rest.datatypes import Object,GeoPoint #api found at https://github.com/dgrtwo/ParsePy
from parse_rest.connection import register

#self written
from location_guesser import LocationGuesser as Locator

#TODO: amazon python sdk http://aws.amazon.com/sdkforpython/
#TODO: only 1 entry per thread id. only add if a location was found and the previous entry wasn't present!

#DONE: include geopoint object per each reuse item!

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
    
class TestReuseItem_rev2(Object):
    pass
 
class WheresThatBuildingTEST_rev2(Object):
    pass

class ReuseParser(object):
    #something profound should go here as a comment
    
    def __init__(self):
       self.buildingLocationDict = {} 
       self.storeBuildingLocations()
       
    def storeBuildingLocations(self):
        #queries the list of building locations from parse and stores them for faster lookup.
        allBuildingLocations = WheresThatBuildingTEST_rev2.Query.all()
        for building in allBuildingLocations:
            name = building.buildingName
            gps_lng = building.gps_lng
            gps_lat = building.gps_lat
            self.buildingLocationDict[name]=(gps_lat,gps_lng)
    
    def getGpsLocation(self, someGuess):
        #given a location, return a geopoint object if stored in the lookup table, else 
        #returns None
        if someGuess.foundLocation and self.buildingLocationDict.has_key(someGuess.generalLocation):
            (gps_lat,gps_lng) = self.buildingLocationDict[someGuess.generalLocation]
            return GeoPoint(latitude=gps_lat, longitude=gps_lng)
        
    def createReuseItem(self,email,guess):
        #standardizes how the reuse item class should look

        sent_timestamp = time.mktime(email.sent_at.timetuple())
        
        #parcel the object
        ReuseItem = TestReuseItem_rev2(email_id= email.thread_id,
        email_body= email.body, 
        email_sender= email.fr,
        email_subject= email.subject, 
        
        item_location_general= guess.generalLocation, #the location of the guess
        item_location_specific= guess.specificLocation, #the location of the guess
        guess_found= guess.foundLocation, #did the parser actually find anything 
        
        keywords=["reuse","such recycle","much trash"], #frontend data
        uniqueViewers= 0,
        claimed= False,
        claimed_by= "",
        
        email_timestamp_unix= sent_timestamp) #and the timestamp
        
        somePoint = self.getGpsLocation(guess)
        if somePoint is not None:
            #set the geopoint if we know where it is!
            ReuseItem.gps_location = GeoPoint(latitude=somePoint.latitude, longitude=somePoint.longitude)
        else:
            print "could not find location _%s_ in lookup dict" % guess.generalLocation
            
        return ReuseItem
        
    def yesItShould(self):
        #runs the whole shebang
        
        #the gmail object
        g = Gmail()
        g.login("radixdeveloper", "whereisstrauss")

        #the location object
        loc = Locator()

        # emails = g.label("reuse").mail(unread=True,prefetch=True)
        emails = g.label("reuse").mail(prefetch=True)
        # emails = emails[0:2]
        for email in emails:
            locationGuess = loc.makeGuessByEmail(email)
            ReuseItem = self.createReuseItem(email,locationGuess)
            ReuseItem.save()

        g.logout()

if (__name__ == "__main__"):
    #we're running!
    # runTest()
    registerAppWithParse()

    ShouldItRun = ReuseParser()
    # for a in ShouldItRun.buildingLocationDict:
        # print a
    ShouldItRun.yesItShould()
    
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