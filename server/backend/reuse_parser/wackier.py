import difflib
testText = "Here is the text we are trying to match across to find the three word sequence n0 inf0rmation available I wonder if we will find it?"  
testText2 = "I have some shitty items in bAker that I want gone."  

# words = testText.split(" ")
# d = [words, words[1:], words[2:],words[3:]]
# a = zip(*d)
# # three = [' '.join([i,j,k]) for i,j,k in zip(words, words[1:], words[2:])]
# # print three
# # print "3"
# print a,"a"
# print d,"d"
# # b = zip(a,words[3:])
# # print b
# # print "b"

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
    
    return difflib.get_close_matches(wordSequence, joined, cutoff=0.72389)
    
print findWords(testText,"no information available I w0nder")
print findWords(testText2,"Baker that")
print findWords(testText,"txt")