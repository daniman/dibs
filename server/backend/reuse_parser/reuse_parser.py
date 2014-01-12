from gmail import Gmail #https://github.com/charlierguo/gmail
from location_guesser import LocationGuesser as Locator

def runTest():
    #the gmail object
    g = Gmail()
    g.login("radixdeveloper", "whereisstrauss")
    
    #the location object
    loc = Locator()
   

    emails = g.label("reuse").mail(prefetch=True)
    # email0 = emails[0]
    # print email0.fr
    for email in emails:
        # emails[0].fetch()
        location = loc.makeGuessByEmail(email)
        if not location:
            print email.body
            print 'SUBJECT====>',email.subject
            print 'SENDER====>',email.fr
            
            print 'LOCATION====>',location
            print "="*40
            print "\n"*5

    g.logout()


if (__name__ == "__main__"):
    #we're running!
    runTest()
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