# Test Error Handling Scenarios

This document provides step-by-step instructions for testing the enhanced error handling in the test-taking page.

## Prerequisites
- Frontend running: `npm run dev`
- Backend running: `mvn spring-boot:run`
- Valid test template created
- User logged in via Clerk

## Test Scenarios

### Scenario 1: Successful Retry on Server Error

**Goal**: Verify automatic retry works when server returns 500 error then recovers

**Steps**:
1. Start a test session normally
2. During the test, stop the backend server:
   ```bash
   # In backend terminal, press Ctrl+C
   ```
3. Click "Далее" to go to next question
4. **Expected Behavior**:
   - Loading skeleton appears
   - Toast: "Повторная попытка... (1/3)"
   - Retry indicator shows in skeleton
5. Wait 1 second, still failing
   - Toast: "Повторная попытка... (2/3)"
6. Restart backend server:
   ```bash
   mvn spring-boot:run
   ```
7. **Expected Behavior**:
   - Third retry succeeds
   - Question loads successfully
   - Normal test flow continues

**Success Criteria**:
- ✅ Automatic retry attempted 3 times
- ✅ Toast notifications shown
- ✅ Loading indicators visible
- ✅ Test continues after backend recovery

---

### Scenario 2: All Retries Fail - Manual Retry

**Goal**: Verify error screen with manual retry option

**Steps**:
1. Stop the backend server completely
2. Navigate to test page: `/test-templates/take/{sessionId}`
3. **Expected Behavior**:
   - Loading skeleton with retry indicators
   - 3 automatic retry attempts (1s, 2s, 4s delays)
   - Error card appears after all retries fail:
     - Title: "Ошибка сервера"
     - Message: User-friendly explanation
     - HTTP 500 status badge
     - "Попробовать снова" button
     - "К списку тестов" button
4. Restart backend server
5. Click "Попробовать снова"
6. **Expected Behavior**:
   - Page reloads
   - Question loads successfully

**Success Criteria**:
- ✅ Error screen appears after 3 failed retries
- ✅ Clear error message in Russian
- ✅ Manual retry works after server recovery

---

### Scenario 3: 404 Not Found Error

**Goal**: Verify proper handling when session doesn't exist

**Steps**:
1. Navigate to: `/test-templates/take/00000000-0000-0000-0000-000000000000`
2. **Expected Behavior**:
   - No retry attempts (404 is not retryable)
   - Error card appears immediately:
     - Title: "Тест не найден"
     - Message: "Сессия тестирования не найдена..."
     - HTTP 404 status badge
     - Only "К списку тестов" button (no retry)
3. Click "К списку тестов"
4. **Expected Behavior**:
   - Redirected to `/test-templates`

**Success Criteria**:
- ✅ No retry attempts
- ✅ Immediate error display
- ✅ Contextual error message
- ✅ Only redirect option (no retry button)

---

### Scenario 4: 400 Invalid State Error

**Goal**: Verify proper handling when session is completed/abandoned

**Steps**:
1. Start and complete a test session normally
2. Note the session ID from URL
3. Navigate back to: `/test-templates/take/{completed-session-id}`
4. **Expected Behavior**:
   - No retry attempts (400 is not retryable)
   - Error card appears:
     - Title: "Недействительная сессия"
     - Message: "Эта сессия тестирования уже завершена или отменена"
     - HTTP 400 status badge
     - Only "К списку тестов" button
5. Click "К списку тестов"
6. **Expected Behavior**:
   - Redirected to `/test-templates`

**Success Criteria**:
- ✅ No retry attempts on 400 errors
- ✅ Clear error message about session state
- ✅ Redirect option provided

---

### Scenario 5: Network Throttling

**Goal**: Verify retry works with slow network

**Steps**:
1. Open Chrome DevTools → Network tab
2. Set throttling to "Slow 3G"
3. Start a test session
4. **Expected Behavior**:
   - Longer loading times
   - If request times out, automatic retry
   - Eventually loads successfully or shows error
5. Restore network to "No throttling"
6. Try manual retry if error shown
7. **Expected Behavior**:
   - Loads quickly with normal network

**Success Criteria**:
- ✅ Graceful handling of slow network
- ✅ Retry logic works with timeouts
- ✅ Recovery when network improves

---

### Scenario 6: Rapid Navigation During Retry

**Goal**: Verify no race conditions during retries

**Steps**:
1. Trigger a 500 error (stop backend)
2. Let retry #1 start (1 second delay)
3. Quickly navigate away (press back button or close tab)
4. **Expected Behavior**:
   - Clean navigation
   - No errors in console
   - Retry aborted gracefully
5. Navigate back to test page
6. **Expected Behavior**:
   - Fresh load attempt
   - No stale retry state

**Success Criteria**:
- ✅ No console errors during navigation
- ✅ Clean state after navigation
- ✅ No memory leaks from abandoned retries

---

### Scenario 7: React Error Boundary

**Goal**: Verify error.tsx catches unhandled errors

**Steps**:
1. Navigate to test page
2. Open browser console
3. Force an unhandled error (modify code temporarily):
   ```typescript
   // In page.tsx, add after line 700:
   throw new Error('Test error boundary');
   ```
4. **Expected Behavior**:
   - Error boundary catches error
   - Error page displays from `error.tsx`
   - Shows "Попробовать снова" button
   - Shows "К списку тестов" button
5. Click "Попробовать снова"
6. **Expected Behavior**:
   - Page resets and attempts to reload
   - Error persists (because code still throws)
7. Remove the test error code
8. Click "Попробовать снова"
9. **Expected Behavior**:
   - Page loads successfully

**Success Criteria**:
- ✅ Error boundary catches unhandled errors
- ✅ Friendly error page shown
- ✅ Reset button works

---

### Scenario 8: Development Mode Error Details

**Goal**: Verify dev mode shows technical details

**Steps**:
1. Ensure `NODE_ENV=development` (default for `npm run dev`)
2. Trigger any error (e.g., 404 or 500)
3. **Expected Behavior**:
   - Error card shows "Dev Info:" section
   - Technical error message visible
   - Stack trace or error details shown
4. Build for production:
   ```bash
   npm run build
   npm start
   ```
5. Trigger same error
6. **Expected Behavior**:
   - No "Dev Info:" section
   - Only user-friendly messages

**Success Criteria**:
- ✅ Dev mode shows technical details
- ✅ Production hides technical details
- ✅ No sensitive info leaked in production

---

### Scenario 9: Retry Indicator Visual Feedback

**Goal**: Verify visual feedback during retries

**Steps**:
1. Trigger 500 error (stop backend)
2. Navigate to test page
3. **Observe during retry attempts**:
   - Skeleton loader shows
   - Retry counter: "Повторная попытка 1 из 3..."
   - Spinning loader icon
   - Progress updates for each retry
4. **Expected Behavior**:
   - Clear visual indication of retry state
   - User knows system is working
   - Not stuck on blank screen

**Success Criteria**:
- ✅ Retry counter visible and accurate
- ✅ Animated loader shows activity
- ✅ User understands what's happening

---

### Scenario 10: Multiple Concurrent Requests

**Goal**: Verify retry doesn't cause duplicate requests

**Steps**:
1. Open Network tab in DevTools
2. Stop backend
3. Navigate to test page
4. **Observe network requests**:
   - Initial request fails
   - Retry #1 after 1s
   - Retry #2 after 2s
   - Retry #3 after 4s
   - Total: 4 requests (1 initial + 3 retries)
5. **Expected Behavior**:
   - Exactly 4 requests total
   - No overlapping retries
   - No duplicate submissions

**Success Criteria**:
- ✅ Correct number of retry attempts
- ✅ No request overlap
- ✅ Clean sequential retry pattern

---

## Monitoring Checklist

### Browser Console
- [ ] No JavaScript errors
- [ ] No React warnings
- [ ] No unhandled promise rejections
- [ ] Retry logs visible (in dev mode)

### Network Tab
- [ ] Correct API endpoints called
- [ ] Proper retry delays observed
- [ ] No duplicate requests
- [ ] Correct HTTP headers

### User Experience
- [ ] No blank screens
- [ ] Loading states always visible
- [ ] Error messages clear and actionable
- [ ] Navigation works during errors
- [ ] No infinite loops

### Performance
- [ ] No memory leaks
- [ ] Retries don't block UI
- [ ] Timeouts work correctly
- [ ] State cleaned up on unmount

## Regression Testing

After implementing error handling, verify core functionality still works:

1. **Normal Test Flow**:
   - [ ] Start test → works
   - [ ] Answer questions → works
   - [ ] Navigate back (if allowed) → works
   - [ ] Complete test → works
   - [ ] View results → works

2. **Session Management**:
   - [ ] Create new session → works
   - [ ] Resume existing session → works
   - [ ] Abandon session → works
   - [ ] Timer countdown → works

3. **Question Types**:
   - [ ] Likert scale → works
   - [ ] Single choice → works
   - [ ] Multiple choice → works
   - [ ] Open text → works

## Success Criteria Summary

The implementation is successful if:

✅ Server errors (5xx) trigger automatic retry up to 3 times
✅ Client errors (4xx) show immediate error without retry
✅ All error messages are user-friendly in Russian
✅ Loading states clearly indicate retry progress
✅ Manual retry option provided for recoverable errors
✅ Non-recoverable errors show redirect options
✅ No infinite retry loops
✅ No console errors or warnings
✅ Development mode shows technical details
✅ Production mode hides technical details
✅ Error boundaries catch unhandled exceptions
✅ Normal test flow unaffected by error handling code
