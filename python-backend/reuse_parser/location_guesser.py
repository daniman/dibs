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
        if len(lastname)>0:
            newBody = re.sub(r""+lastname+"(.|\d|\r|\n)*", '', body, flags=re.MULTILINE)
    else:
        #only a firstname!
        if len(firstname)>0:
            newBody = re.sub(r""+firstname+"(.|\d|\r|\n)*", '', body, flags=re.MULTILINE)

    return newBody

# def getSignatureFromParts(largerBody, smallerBody):
    # #this whole pipeline is dumb really
    # #gets the part of largerBody not included by smallerBody
    # if not (smallerBody in largerBody):
        # return ""
     
    # return largerBody.replace(smallerBody,"").strip()    
    
class Guess(object):
    #stores a guess 
    #lastResort is ONLY true if the location was found in the signature
    def __init__(self, general, specific, foundIt=True, lastResort = False):
        self.lastResort = lastResort
        if (foundIt):
            self.generalLocation = general.lower().strip()
            self.specificLocation = specific.lower().strip()
            self.foundLocation = True
        else:
            self.generalLocation = "0"
            self.specificLocation = "0"
            self.foundLocation = False
        
    def __str__(self):
        return self.generalLocation + ":"+ self.specificLocation
        
class dummyEmail(object):
    #a fake email object that stores attributes
    def __init__(self):
        self.body = ""
        self.subject = ""
        self.fr= ""
        
class LocationGuesser(object):

    def __init__(self):
        self.locationList = ["edgerton", "sidney pacific", "warehouse",
        "simmons","baker", "mccormick", "eastgate", "senior",
        "ashdown","maseeh","burton-conner","new house","random","bexley","stata","stud", "student center",
        "east campus"]
        
        #used to internally redirect dorms to their building numbers
        # self.locationMap = {}
        # self.locationMap["edgerton","4"]
        # self.locationMap["sidney pacific","nw86"]
        # self.locationMap["warehouse","ww15"]
        # self.locationMap["simmons","w79"]
        
        # self.locationMap["baker","w7"]
        # self.locationMap["mccormick","w4"]
        # self.locationMap["eastgate","e55"]
        # self.locationMap["senior","e2"]
        # self.locationMap["ashdown","nw35"]
        # self.locationMap["maseeh","w1"]
        # self.locationMap["burton-conner","w51"]
        # self.locationMap["new house","w70"]
        # self.locationMap["random","nw61"]
        # self.locationMap["bexley","w13"]
        # self.locationMap["stata","32"]
        # self.locationMap["stud" | "student center","w20"]
        # self.locationMap[""east campus"","62"]

        
        self.noGuess = Guess("","",False)
    
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
        
        if len(text)==0:
            return Guess("","",False)
            
        text = urlStripper(text)
        buildingGuess = self.getLocation_building(text)
        locationGuess = self.getLocation_floor(text)
        dormGuess = self.getLocation_word(text)
        
        #building guesses have highest priority!
        if buildingGuess.foundLocation:
            return buildingGuess
            
        if locationGuess.foundLocation:
            return locationGuess
            
        if dormGuess.foundLocation:
            return dormGuess
            
        return Guess("","",False)

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
        fr = email.fr.lower().strip()
        body = email.body.lower().strip()
        subject = email.subject.lower().strip()
        
        #build the text to parse
        newBody = removeSignature(email.fr, email.body)
        text = email.subject +" "+newBody
        
        guessText = self.makeGuess(text)
        
        if guessText.foundLocation:
            return guessText
        
        # return self.makeGuess(text)
        
        #oh crap, scraping the bin on this one, let the signature remain in there!
        guessSignature = self.makeGuess(email.subject +" "+body)
        guessSignature.lastResort=True
        return guessSignature
        
    def getLocation_building(self,text):
        #buildings are usually in the X-Y format. returns "X : Y"
        #{1,2} since 34 is a building but not 23232
        #NINJA'D! E15-468 is now caught!
        m_obj = re.search(r"(nw|n|ne|e|w)?(\d{1,2})-(\d{1,3})",text)
        if m_obj:
            #determine if this is a time!
            pos = m_obj.start()
            encasingString = getEncasingString(text, pos, 8)
            time_obj = re.search(r"(am)|(pm)",encasingString)
            if not time_obj:
                #not a time!
                # return m_obj.group(1)+":"+ m_obj.group(2)
                if (m_obj.group(1)==None):
                    return Guess(m_obj.group(2),m_obj.group(3))    
                else :
                    return Guess(m_obj.group(1)+m_obj.group(2),m_obj.group(3))        
            
        #sometimes its like "E38" or "E 38"
        k_obj = re.search(r"(\b)(nw|n|ne|e|w)( ){0,2}(\d+)",text.lower())
        if k_obj:
            return Guess(k_obj.group(2)+k_obj.group(4),"0")
            
        #sometimes in the form "building/lobby 36"
        #sometimes building is abbreviated to bldg or bldg.
        b_obj = re.search(r"(\b)((building)|(lobby)|(bldg)|(bldg\.))( ){0,2}(#)?(\d{1,2})",text.lower())
        if b_obj:
            if (b_obj.group(2)=="lobby"):
                return Guess(b_obj.groups()[-1], "lobby")
            else:
                return Guess(b_obj.groups()[-1], "0")  
            
        return self.noGuess

    def getLocation_floor(self,text):
        #commonly says "on the X floor of Y". returns "X : Y"
        m_obj = re.search(r"(\S+)(\s)(floor of)(\s)(\S+)",text)    
        if m_obj:
            # return m_obj.group(5)+":"+ m_obj.group(1)
            return Guess(m_obj.group(5),m_obj.group(1))
            
        return self.noGuess
     
    def getLocation_word(self,text):
        #iterate over the dorms and try to get a winner
        locationListMatches = []
        for dorm in self.locationList:
            suspectDorm = findWords(text.lower(),dorm.lower())
            if (len(suspectDorm)):
                locationListMatches.append((dorm,suspectDorm))
        
        if (len(locationListMatches)==0):
            return self.noGuess
            
        # if DEBUG: print locationListMatches
        #sort by their # of matches
        locationListMatches.sort(key=lambda (x,y): len(y), reverse=True)
        # if DEBUG: print locationListMatches
        
        #arbitrarily take the first as the most likely
        dormMatch = locationListMatches[0][0]

        if (dormMatch=="stud"):
            dormMatch = "student center"
            
        return Guess(dormMatch,"0")

        
        
        
        
    
class LocationGuess_methods_Tests(unittest.TestCase):
    
    def setUp(self):
        self.L = LocationGuesser()
        print "\nIn method", self._testMethodName 

    def testLG_bulidingMatch_case1(self):
        result = self.L.getLocation_building("Old Electronics Outside 5-017")
        self.assertEquals(result.__str__(),"5:017")
        
    def testLG_bulidingMatch_case2(self):
        #E48
        result = self.L.getLocation_building("Vibrating *** toys in E48 lobby")
        self.assertEquals(result.__str__(),"e48:0")
        
    def testLG_buildingMatch_case3(self):
        result = self.L.getLocation_building("large dildo in building 36")
        self.assertEquals(result.__str__(),"36:0")        
        
        result = self.L.getLocation_building("large dildo in building #36")
        self.assertEquals(result.__str__(),"36:0")
     
    def testLG_buildingMatch_lobby(self):
        result = self.L.getLocation_building("free twizzlers in lobby 5")
        self.assertEquals(result.__str__(),"5:lobby")        
        
    def testLG_buildingMatch_abbreviated_1(self):
        result = self.L.getLocation_building("gta v in bldg 5 along ")
        self.assertEquals(result.__str__(),"5:0")   
        
        result = self.L.getLocation_building("gta iv in bldg. 4")
        self.assertEquals(result.__str__(),"4:0")   
        
    def testLG_floorMatch(self):
        result = self.L.getLocation_floor("Free things are on the 3rd floor of 36")
        self.assertEquals(result.__str__(),"36:3rd")
        
    def testLG_dorm(self):
        result = self.L.getLocation_word("Free bagels outside baker")
        self.assertEquals(result.__str__(),"baker:0")
        
        result = self.L.getLocation_word("Free sist at simmons")
        self.assertEquals(result.__str__(),"simmons:0")        
        
        result = self.L.getLocation_word("pick up in burton-conner.")
        self.assertEquals(result.__str__(),"burton-conner:0")        
        
        result = self.L.getLocation_word("dolce gabbana shoes and oprah at the stata center")
        self.assertEquals(result.__str__(),"stata:0")
    
    def testLG_dorm_studentCenter(self):
        result = self.L.getLocation_word("lots of action at the student center")
        self.assertEquals(result.__str__(),"student center:0")
                
        result = self.L.getLocation_word("stupid ugly shirts at the stud for a short time")
        self.assertEquals(result.__str__(),"student center:0")
        
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
        self.assertEquals(result.__str__(),"5:017")
        
        result = self.L.makeGuess("Free things are on the 3rd floor of 36")
        self.assertEquals(result.__str__(),"36:3rd")
                
        result = self.L.makeGuess("Free sist at simmons")
        self.assertEquals(result.__str__(),"simmons:0")
     
    def testLG_makeGuess_priority_1(self):
        result = self.L.makeGuess("Old Electronics Outside 5-017 and at simmons")
        self.assertEquals(result.__str__(),"5:017")
        
    def testLG_makeGuess_priority_2(self):    
        result = self.L.makeGuess("Old Electronics Outside 5-017 and at e48")
        self.assertEquals(result.__str__(),"5:017")
        
    def testLG_makeGuess_priority_3(self):    
        result = self.L.makeGuess("Old Electronics Outside 5th floor of stud and at e48")
        self.assertEquals(result.__str__(),"e48:0")

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
        self.assertEquals(result.__str__(),"6:205")

class LocationGuess_if_it_aint_broke(unittest.TestCase):
    #a bunch of tests designed to break it!
    
    def setUp(self):
        self.L = LocationGuesser()
        print "\nIn method", self._testMethodName   
        
    def testLG_hammertime(self):
        result = self.L.makeGuess("Old Electronics Outside simmons from 9-5pm")
        self.assertEquals(result.__str__(),"simmons:0")
        
    def testLG_returnsNoGuess(self):
        result = self.L.makeGuess("Old Electronics Outside")
        self.assertEquals(result.__str__(),self.L.noGuess.__str__())
        
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
        self.assertEquals(locationGuess.__str__(),"1:143")
        
    def testLG_laptopChick(self):
        text = """[Reuse] Pavilion dv6 laptop keyboard New Pavilion dv6 laptop keyboard 
            from Amazon, outside 32-044 http://www.amazon.com/gp/product/B004WY4U8S/ref=oh_details_o00_s00_i00?ie=UTF8&psc=1

            Had I read the list of compatible models on Amazon, I would have seen that my computer isn't listed. 
            Although the data cable wasn't the correct size, I did manage to make it work by pushing it all
            the way to one side; the only problem was that there were a few tabs that prevented the keyboard
            from fitting exactly. Duct tape could probably have fixed this."""
                
        locationGuess = self.L.makeGuess(text)
        self.assertEquals(locationGuess.__str__(),"32:044")
        
    def testLG_2laptops1post(self):
        text = """[Reuse] One Laptop Per Child laptop and charger I have a One Laptop Per Child laptop and charger.

            It boots and seems to work, but no promises since I don't know much about
            its history.

            Looks like this:
            http://cdn.hoboken411.com/wp-content/uploads/2007/11/one-laptop-per-child-hoboken.jpg

            Pick up in Burton-Conner.

            - Max"""
                
        locationGuess = self.L.makeGuess(text)
        self.assertEquals(locationGuess.__str__(),"burton-conner:0")
        
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
        self.assertEquals(locationGuess.__str__(),"24:108")    
    
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
        self.assertEquals(result.__str__(),"38:177")
        
    def testLG_appleBannana(self):
        email = dummyEmail()
        email.subject = "[Reuse] Apple 24 inch Displayport Display (Does not power on.)"
        email.fr = "Thomas Brand <tbrand@mit.edu>"
        email.body =  """
            i have a apple 24 inch displayport display up for reuse at e17-110. the display has had its logic board replaced 
            multiple times, but continues to fail. it may need a psu replacement at this point along with a new logic board, but it is out of warranty.
             up for grabs to the first person who wants it. ask for me at the desk. i will post again when it is gone.

            https://www.apple.com/pr/library/2008/10/14apple-unveils-24-inch-led-cinema-display-for-new-macbook-family.html

            thomas brand
            team lead, hardware & software services

            mit information systems & technology
            40 ames st. | cambridge, ma 02139
            617-324-7527 | ist.mit.edu/help


            _______________________________________________
            to sub/unsubscribe or to see the list rules:  http://mailman.mit.edu/mailman/listinfo/reuse"""
            
        result = self.L.makeGuessByEmail(email)
        self.assertEquals(result.__str__(),"e17:110")
        
    def testSignatureLastResort(self):
        email = dummyEmail()
        email.subject = "[Reuse] 1000 piece puzzle - Hometown Collection - will send inter-offic IF you supply bldg. and room #"
        email.fr = "Helen F Ray <hfray@mit.edu>"
        email.body =  """
            i have a face.


            Helen F. Ray
            Administrative Asst.
            Dept. of Political Science
            77 Mass. Avenue, E53-370
            Cambridge, MA 02139
            ________________________________________
            to sub/unsubscribe or to see the list rules:  http://mailman.mit.edu/mailman/listinfo/reuse"""
            
        result = self.L.makeGuessByEmail(email)
        self.assertEquals(result.__str__(),"e53:370")
        self.assertEquals(result.lastResort,True)
     
    
   
class LocationGuess_miscTests(unittest.TestCase):
    def setUp(self):
        self.L = LocationGuesser()
        print "\nIn method", self._testMethodName   

    def testE15_468(self):
        result = self.L.makeGuess("Old Electronics Outside e15-468")
        self.assertEquals(result.__str__(),"e15:468")   

        
if __name__=="__main__":
    #useful use guide
    
    # testString = """Old Electronics Outside 5-017 and 6- and 67- 5 - 017. 
    # And also, Free things are on the 3rd floor of 36. 
    # Free bagels outside baker. """
    
    # LG = LocationGuesser()
    
    # if DEBUG: print 'floor match',LG.getLocation_floor(testString)
    # if DEBUG: print 'building match',LG.getLocation_building(testString)
    # if DEBUG: print 'dorm match',LG.getLocation_word(testString)
    
    #run tests
    unittest.main()
else:
    #imported!
    pass