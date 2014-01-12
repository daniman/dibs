import difflib
import unittest
import re #http://flockhart.virtualave.net/RBIF0100/regexp.html

DEBUG = False

def getEncasingString(text, pos, radius):
    #get the 16 chars fore and aft of the match
    # pos = text.find(substring)
    # if pos==-1: 
        # return ""
    
    fore = max(0,pos-radius)
    aft = min( len(text), pos + radius)
    
    return text[pos:aft]
    
def joinAllInTupleList(toupe):
    #joinAllInTuple( [("hello", "world"),("face","book")]) = ['hello world', 'face book']
    result=[]
    for i in toupe:
        #i is the tuple itself
        carry = " "
        for z in i:
            #z is an element of i
            carry+=" "+z
            
        result.append(carry.strip())
    return result
    
def findWords(text,wordSequence):
    #setup
    words = text.split(" ")
    
    #get a list of subLists based on the length of wordSequence
    #i.e. get all wordSequence length sub-sequences in text!
    
    result=[]
    numberOfWordsInSequence = len(wordSequence.strip().split(" ")) 
    for i in range(numberOfWordsInSequence):
        result.append(words[i:])
    
    # if DEBUG: print 'result',result
    c=zip(*result)
    
    # if DEBUG: print 'c',c
    #join each tuple to a string
    joined = joinAllInTupleList(c)
    
    #.72 is a good cutoff
    
    return difflib.get_close_matches(wordSequence, joined, cutoff=0.85)

def urlStripper(text):
    #return text but without a url inside!
    
    #delete apparent urls with slashes in them
    text = re.sub(r"\b(\w|\.)*(\\|/)(\w|\.)*\b",'',text)
    
    #delete http like urls
    return re.sub(r'http?(s)?:\/\/.*[\r\n]*', '', text, flags=re.MULTILINE)
    
def removeSignature(sender, body):
    #attempts to remove the signature from body
    #returns body without the signature
    # sender = sender.strip().lower()
    # body = body.strip().lower()
    
    #strip the email from the sender string
    newSender = re.sub(r'(<)[^>]*(>)', '', sender, flags=re.MULTILINE)
    
    #find where newSender appears in body
    
    #delete everything after their name in body
    exp = newSender.split(" ")
    if DEBUG: print 'EXP====>',exp
    firstname = exp[0]
    if (len(exp)>1):
        #first and last name included!
        lastname = re.escape(exp[-2])
        if DEBUG: print 'LASTNAME====>',lastname
        newBody = re.sub(r""+lastname+"(.|\d|\r|\n)*", '', body, flags=re.MULTILINE)
    else:
        #only a firstname!
        newBody = re.sub(r""+firstname+"(.|\d|\r|\n)*", '', body, flags=re.MULTILINE)

    return newBody
 
class dummyEmail(object):
    #a fake email object that stores attributes
    def __init__(self):
        self.body = ""
        self.subject = ""
        self.fr= ""
        
class LocationGuesser(object):

    def __init__(self):
        self.locationList = ["edgerton", "sidney pacific", "warehouse",
        "simmons","baker", "mccormick", "eastgate", 
        "ashdown","masseeh","burton-conner","new house","random","bexley","memorial"]
        
        self.noGuess = ""
    
    def makeGuess(self,text):
        #DEPRECATED -> use makeGuessByEmail(email) to filter out the signatures
        #takes some text, attempts to make a guess as to where the post is located
        #guess -> (LocationType, Location)
            #(LocationType,Location) -> 
                # ("building", "*X:*Y")
                # ("floorwise", "X*:Y")
                # ("dorm", "*X")
                    #X->General location (Simmons, 34, etc.)
                    #Y->Specific location (3rd floor, 017, 343, etc.
                    
        text = urlStripper(text)
        buildingGuess = self.getLocation_building(text)
        locationGuess = self.getLocation_floor(text)
        dormGuess = self.getLocation_dorm(text)
        
        #building guesses have highest priority!
        if buildingGuess is not self.noGuess:
            return buildingGuess
            
        if locationGuess is not self.noGuess:
            return locationGuess
            
        if dormGuess is not self.noGuess:
            return dormGuess

    def makeGuessByEmail(self,email):
        #same as makeGuess, but with the email as argument
        #takes some email, attempts to make a guess as to where the post is located
        #guess -> (LocationType, Location)
            #(LocationType,Location) -> 
                # ("building", "*X:*Y")
                # ("floorwise", "X*:Y")
                # ("dorm", "*X")
                    #X->General location (Simmons, 34, etc.)
                    #Y->Specific location (3rd floor, 017, 343, etc.
                    

        
        #put all email attr's to lowercase and trim them!
        email.fr = email.fr.lower().strip()
        email.body = email.body.lower().strip()
        email.subject = email.subject.lower().strip()
        
        #build the text to parse
        newBody = removeSignature(email.fr, email.body)
        text = email.subject +" "+newBody
        return self.makeGuess(text)
        
    def getLocation_building(self,text):
        #buildings are usually in the X-Y format. returns "X : Y"
        #{1,2} since 34 is a building but not 23232
        m_obj = re.search(r"(\d{1,2})-(\d{1,3})",text)
        if m_obj:
            #determine if this is a time!
            pos = m_obj.start()
            encasingString = getEncasingString(text, pos, 8)
            time_obj = re.search(r"(am)|(pm)",encasingString)
            if not time_obj:
                #not a time!
                return m_obj.group(1)+":"+ m_obj.group(2)
            # else:
                # print time_obj.group(0)
                # print encasingString
            
        #sometimes its like "E38" or "E 38"
        k_obj = re.search(r"(\b)(nw|n|ne|e|w)( ){0,2}(\d+)",text.lower())
        if k_obj:
            return k_obj.group(2)+":"+ k_obj.group(4)
            
        return self.noGuess

    def getLocation_floor(self,text):
        #commonly says "on the X floor of Y". returns "X : Y"
        m_obj = re.search(r"(\S+)(\s)(floor of)(\s)(\S+)",text)    
        if m_obj:
            return m_obj.group(5)+":"+ m_obj.group(1)
            
        return self.noGuess
     
    def getLocation_dorm(self,text):
        #iterate over the dorms and try to get a winner
        locationListMatches = []
        for dorm in self.locationList:
            suspectDorm = findWords(text.lower(),dorm.lower())
            if (len(suspectDorm)):
                locationListMatches.append((dorm,suspectDorm))
        
        if (len(locationListMatches)==0):
            return None
            
        # if DEBUG: print locationListMatches
        #sort by their # of matches
        locationListMatches.sort(key=lambda (x,y): len(y), reverse=True)
        # if DEBUG: print locationListMatches
        
        #arbitrarily take the first as the most likely
        dormMatch = locationListMatches[0][0]
        return dormMatch

class LocationGuess_methods_Tests(unittest.TestCase):
    
    def setUp(self):
        self.L = LocationGuesser()
        print "\nIn method", self._testMethodName 

    def testLG_bulidingMatch_case1(self):
        result = self.L.getLocation_building("Old Electronics Outside 5-017")
        self.assertEquals(result,"5:017")
        
    def testLG_bulidingMatch_case2(self):
        #E48
        result = self.L.getLocation_building("Vibrating *** toys in E48 lobby")
        self.assertEquals(result,"e:48")
        
    def testLG_buildingMatch_case3(self):
        result = self.L.getLocation_building("large dildo in building 36")
        self.assertEquals(result,"36:0")
        
    def testLG_floorMatch(self):
        result = self.L.getLocation_floor("Free things are on the 3rd floor of 36")
        self.assertEquals(result,"36:3rd")
        
    def testLG_dorm(self):
        result = self.L.getLocation_dorm("Free bagels outside baker")
        self.assertEquals(result,"baker")
        
        result = self.L.getLocation_dorm("Free sist at simmons")
        self.assertEquals(result,"simmons")
        
    def testUrlStripper(self):
        text = "outside 32-044 http://www.amazon.com/gp/product/B004WY4U8S/ref=oh_details_o00_s00_i00?ie=UTF8&psc=1 Had I read the"
        self.assertEquals(urlStripper(text), "outside 32-044 ")
        
        text = "outside 32-044 https://www.amazon.com/gp/product/B004WY4U8S/ref=oh_details_o00_s00_i00?ie=UTF8&psc=1 Had I read the"
        self.assertEquals(urlStripper(text), "outside 32-044 ")       
        
class LocationGuess_class_Tests(unittest.TestCase):
    
    def setUp(self):
        self.L = LocationGuesser()
        print "\nIn method", self._testMethodName    

    def testLG_makeGuess_clearCutResult(self):
        result = self.L.makeGuess("Old Electronics Outside 5-017")
        self.assertEquals(result,"5:017")
        
        result = self.L.makeGuess("Free things are on the 3rd floor of 36")
        self.assertEquals(result,"36:3rd")
                
        result = self.L.makeGuess("Free sist at simmons")
        self.assertEquals(result,"simmons")
     
    def testLG_makeGuess_priority_1(self):
        result = self.L.makeGuess("Old Electronics Outside 5-017 and at simmons")
        self.assertEquals(result,"5:017")
        
    def testLG_makeGuess_priority_2(self):    
        result = self.L.makeGuess("Old Electronics Outside 5-017 and at e48")
        self.assertEquals(result,"5:017")
        
    def testLG_makeGuess_priority_3(self):    
        result = self.L.makeGuess("Old Electronics Outside 5th floor of stud and at e48")
        self.assertEquals(result,"e:48")

    def testLG_makeGuessByEmail_basic(self):
        email = dummyEmail()
        email.subject = "Ceramic cow cookie jar."
        email.fr = "Jennifer Weisman <jweisman@mit.edu>"
        email.body =  """
            Ceramic cow cookie jar. It's a little scuffed and scratched up but in decent shape and very cute! 
            Please email me off-list if you would like to see pictures. Pickup in 6-205.

            Thanks,

            Jennifer


            ---
            Jennifer L. Weisman
            Academic Administrator
            Department of Chemistry
            Rm. 6-205
            617-253-1845
            jweisman@mit.edu<mailto:jweisman@mit.edu>"""
            
        result = self.L.makeGuessByEmail(email)
        self.assertEquals(result,"6:205")

class LocationGuess_if_it_aint_broke(unittest.TestCase):
    #a bunch of tests designed to break it!
    
    def setUp(self):
        self.L = LocationGuesser()
        print "\nIn method", self._testMethodName   
        
    def testLG_hammertime(self):
        result = self.L.makeGuess("Old Electronics Outside simmons from 9-5pm")
        self.assertEquals(result,"simmons")
        
class LocationGuess_realTests(unittest.TestCase):      
    #real examples go here
    def setUp(self):
        self.L = LocationGuesser()
        print "\nIn method", self._testMethodName   
        
    def testLG_conference(self):
        text = """[Reuse] conference room clean-out chairs, conference table, and various odd and ends.
                outside of 1-143

                thanks!
                kiley"""
                
        locationGuess = self.L.makeGuess(text)
        self.assertEquals(locationGuess,"1:143")
        
    def testLG_laptopChick(self):
        text = """[Reuse] Pavilion dv6 laptop keyboard New Pavilion dv6 laptop keyboard 
            from Amazon, outside 32-044 http://www.amazon.com/gp/product/B004WY4U8S/ref=oh_details_o00_s00_i00?ie=UTF8&psc=1

            Had I read the list of compatible models on Amazon, I would have seen that my computer isn't listed. 
            Although the data cable wasn't the correct size, I did manage to make it work by pushing it all
            the way to one side; the only problem was that there were a few tabs that prevented the keyboard
            from fitting exactly. Duct tape could probably have fixed this."""
                
        locationGuess = self.L.makeGuess(text)
        self.assertEquals(locationGuess,"32:044")
        
    def testLG_2laptops1post(self):
        text = """[Reuse] One Laptop Per Child laptop and charger I have a One Laptop Per Child laptop and charger.

            It boots and seems to work, but no promises since I don't know much about
            its history.

            Looks like this:
            http://cdn.hoboken411.com/wp-content/uploads/2007/11/one-laptop-per-child-hoboken.jpg

            Pick up in Burton-Conner.

            - Max"""
                
        locationGuess = self.L.makeGuess(text)
        self.assertEquals(locationGuess,"burton-conner")
        
    def testLG_brentonsituation(self):
        text = """Slight update; the conference room chairs DO adjust, in the old fashioned screw-type way where you twirl 
        ]the thing around about 100 times to raise it 2",
            -----Original Message-----
            From: reuse-bounces@MIT.EDU [mailto:reuse-bounces@MIT.EDU] On Behalf Of Peter H Brenton
            Sent: Wednesday, January 08, 2014 10:50 AM
            To: reuse@mit.edu
            Subject: [Reuse] Conference room and side chairs

            Appearing Outside 24-108

            About 10 conference room chairs, these chairs tip back, swivel, and are on wheels, but do not adjust up and down so aren't
            perfect for a task chair.  Wood arms, patterned fabric seat and back

            Several (more to come) Red side chairs, upholstered, not wheeled, wood legs.  Kind of a living room chair but with very vertical sides.

            Take em away.  I'll post when all are gone.  You can get to 24 inside via building 12.

            Peter Brenton
            Administrative Officer
            MIT Dept. of Nuclear Science and Engineering Ph. 617-253-3185

            _______________________________________________
            To sub/unsubscribe or to see the list rules:  http://mailman.mit.edu/mailman/listinfo/reuse

            _______________________________________________
            To sub/unsubscribe or to see the list rules:  http://mailman.mit.edu/mailman/listinfo/reuse"""
                
        locationGuess = self.L.makeGuess(text)
        self.assertEquals(locationGuess,"24:108")    
    
    def testLG_fischerprice(self):
        email = dummyEmail()
        email.subject = "[reuse] fw: another xerox 8500/8550 solid ink give away -claimed"
        email.fr = "kathryn a fischer <katfisch@mit.edu>"
        email.body =  """

                i have some xerox 8500/8550 solid ink to give away, too:


                please email to arrange pick-up (i'm behind a locked door in 38-177), or, i can send to you via interdepartmental mail.



                thanks

                kathryn



                _______________________________________________

                to sub/unsubscribe or to see the list rules:  http://mailman.mit.edu/mailman/listinfo/reuse"""
            
        result = self.L.makeGuessByEmail(email)
        self.assertEquals(result,"38:177")
    
if __name__=="__main__":
    #useful use guide
    
    # testString = """Old Electronics Outside 5-017 and 6- and 67- 5 - 017. 
    # And also, Free things are on the 3rd floor of 36. 
    # Free bagels outside baker. """
    
    LG = LocationGuesser()
    
    # if DEBUG: print 'floor match',LG.getLocation_floor(testString)
    # if DEBUG: print 'building match',LG.getLocation_building(testString)
    # if DEBUG: print 'dorm match',LG.getLocation_dorm(testString)
    
    #run tests
    unittest.main()
else:
    #imported!
    pass