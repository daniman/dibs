import difflib
import unittest
import re #http://flockhart.virtualave.net/RBIF0100/regexp.html

#TODO: remove urls!
    #

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
    
    # print 'result',result
    c=zip(*result)
    
    # print 'c',c
    #join each tuple to a string
    joined = joinAllInTupleList(c)
    
    #.72 is a good cutoff
    
    return difflib.get_close_matches(wordSequence, joined, cutoff=0.72389)

def urlStripper(text):
    #return text but without a url inside!
    return re.sub(r'^https?:\/\/.*[\r\n]*', '', text, flags=re.MULTILINE)    

class LocationGuesser(object):

    def __init__(self):
        self.locationList = ["edgerton", "sidney pacific", "warehouse",
        "simmons","baker", "mccormick", "eastgate", 
        "ashdown","masseeh","burton-conner","new house","random","bexley"]
        
        self.noGuess = ""
    
    def makeGuess(self,text):
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
        
    def getLocation_building(self,text):
        #buildings are usually in the X-Y format. returns "X : Y"
        m_obj = re.search(r"(\d+)-(\d+)",text)
        if m_obj:
            return m_obj.group(1)+":"+ m_obj.group(2)
            
        #sometimes its like "E38" or "E 38"
        k_obj = re.search(r"(\b)(nw|n|ne|e|w)( )*(\d+)",text.lower())
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
            
        # print locationListMatches
        #sort by their # of matches
        locationListMatches.sort(key=lambda (x,y): len(y), reverse=True)
        # print locationListMatches
        
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

    def testLG_floorMatch(self):
        result = self.L.getLocation_floor("Free things are on the 3rd floor of 36")
        self.assertEquals(result,"36:3rd")
        
    def testLG_dorm(self):
        result = self.L.getLocation_dorm("Free bagels outside baker")
        self.assertEquals(result,"baker")
        
        result = self.L.getLocation_dorm("Free sist at simmons")
        self.assertEquals(result,"simmons")
        
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
    
    
if __name__=="__main__":
    # a = difflib.SequenceMatcher(None,'no information available','n0 inf0rmation available').ratio()
    # print a

    # testString = """Old Electronics Outside 5-017 and 6- and 67- 5 - 017. 
    # And also, Free things are on the 3rd floor of 36. 
    # Free bagels outside baker. """
    
    # LG = LocationGuesser()
    
    # print 'floor match',LG.getLocation_floor(testString)
    # print 'building match',LG.getLocation_building(testString)
    # print 'dorm match',LG.getLocation_dorm(testString)
    
    #run tests
    unittest.main()
else:
    #imported!
    pass