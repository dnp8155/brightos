import { ConversationIntelligence } from '../src/packages/crm/services/conversation-intelligence';

async function runTests() {
  console.log('--- Testing Conversation Intelligence & CRM Pipeline ---');

  // Test 1: Meeting Request Classification
  const meetingEmail = `Hi Dipak,
Thanks for reaching out and sharing the website audit. The mobile performance issues were eye-opening.
Can we schedule a 15-minute quick call on Thursday at 2 PM EST to discuss pricing and implementation?
Best,
Sarah Jenkins
VP Operations, Apex Logistics`;

  const meetingAnalysis = await ConversationIntelligence.analyzeReplyThread('Sarah Jenkins', 'Apex Logistics', meetingEmail);
  console.log('\n[Test 1] Meeting Request Analysis:', JSON.stringify(meetingAnalysis, null, 2));

  if (meetingAnalysis.classification !== 'Meeting Request' && meetingAnalysis.classification !== 'Interested') {
    throw new Error(`Expected classification 'Meeting Request' or 'Interested', got '${meetingAnalysis.classification}'`);
  }

  // Test 2: RFI with Objections
  const rfiEmail = `Hello,
We might be interested in the ERP customization, but our budget is strictly limited to $15k this quarter. Also, what is your team's timeline for delivery?
Regards,
Mark Stevens`;

  const rfiAnalysis = await ConversationIntelligence.analyzeReplyThread('Mark Stevens', 'TechMatrix Solutions', rfiEmail);
  console.log('\n[Test 2] RFI & Objection Analysis:', JSON.stringify(rfiAnalysis, null, 2));

  if (rfiAnalysis.classification !== 'Request for Information') {
    throw new Error(`Expected classification 'Request for Information', got '${rfiAnalysis.classification}'`);
  }
  if (!rfiAnalysis.objectionsIdentified || rfiAnalysis.objectionsIdentified.length === 0) {
    throw new Error('Expected at least one objection identified');
  }

  // Test 3: Not Interested
  const notInterestedEmail = `Please remove us from your email list. We are not interested in web redesign at this time.
Thanks,
Dave`;

  const notInterestedAnalysis = await ConversationIntelligence.analyzeReplyThread('Dave', 'QuickClean Ltd', notInterestedEmail);
  console.log('\n[Test 3] Not Interested Analysis:', JSON.stringify(notInterestedAnalysis, null, 2));

  if (notInterestedAnalysis.classification !== 'Not Interested') {
    throw new Error(`Expected 'Not Interested', got '${notInterestedAnalysis.classification}'`);
  }

  console.log('\n✅ All CRM Conversation Intelligence Tests Passed Successfully!');
}

runTests().catch(err => {
  console.error('\n❌ Test execution failed:', err);
  process.exit(1);
});
