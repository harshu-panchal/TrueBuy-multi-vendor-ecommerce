Implement this feature in safe phases WITHOUT breaking the existing registration flow, auth flow, vendor onboarding flow, validations, database relations, or frontend state handling.

Goal:
Add an OPTIONAL MLM referral verification step AFTER vendor registration, not during initial registration.

Requirements:
- Do NOT modify existing registration logic unnecessarily.
- Keep backward compatibility.
- Maintain current API responses wherever possible.
- Avoid breaking existing forms, Redux/Zustand state, auth middleware, onboarding logic, and navigation flow.
- Add proper error handling and loading states.
- Use scalable architecture (service layer + controller separation).

========================================
PHASE 1 — DATABASE + BACKEND PREPARATION
========================================

Tasks:
1. Update Vendor schema/model:
   Add:
   - referralCode
   - referralVerified (default false)
   - referralData (optional object)

2. Ensure old vendors remain unaffected.

3. Do NOT change existing registration API behavior.

4. Add indexes only if needed.

5. Add validation-safe migrations if required.

After completion:
- Explain what was added.
- Stop and wait for next phase.

========================================
PHASE 2 — MLM SERVICE INTEGRATION
========================================

Create a dedicated MLM integration service.

Tasks:
1. Create:
   - services/mlm.service.js

2. Add function:
   - verifyReferralCode(referralCode)

3. Use this MLM endpoint:
GET /api/User/users/get-member-details-by-ref/{refId}

4. Add:
   - timeout handling
   - try/catch handling
   - normalized response format

5. Return consistent structure:
{
   valid: boolean,
   data?: object,
   error?: string
}

6. Use environment variable:
MLM_API_BASE_URL

7. Do NOT hardcode URLs.

After completion:
- Explain implemented logic briefly.
- Stop and wait for next phase.

========================================
PHASE 3 — REFERRAL VERIFICATION API
========================================

Create a separate API for referral verification AFTER registration.

Tasks:
1. Create endpoint:
POST /vendor/verify-referral

2. Input:
{
   vendorId,
   referralCode
}

3. Flow:
- Validate vendor exists
- Call MLM service
- If valid:
    save referralCode
    save referralVerified=true
    optionally save referralData
- If invalid:
    return proper error

4. Ensure API is secure.
5. Prevent duplicate verification abuse.
6. Add proper status codes.

Important:
- Existing registration flow must remain untouched.

After completion:
- Explain implementation briefly.
- Stop and wait for next phase.

========================================
PHASE 4 — FRONTEND REFERRAL STEP
========================================

Add a NEW optional referral step AFTER vendor registration.

Tasks:
1. Do NOT merge referral field into existing registration form.

2. Create separate referral screen/page/component.

3. UI Requirements:
- Referral input
- Verify button
- Skip button
- Loading state
- Success message
- Invalid message

4. Flow:
Registration success
   ↓
Referral step
   ↓
Verify OR Skip
   ↓
Continue onboarding/dashboard

5. Skip should work even if referral is invalid.

6. Preserve existing navigation flow.

7. Do NOT break existing onboarding guards.

After completion:
- Explain frontend flow briefly.
- Stop and wait for next phase.

========================================
PHASE 5 — FINAL HARDENING + EDGE CASES
========================================

Tasks:
1. Add protection against:
- duplicate submissions
- API spam
- MLM downtime
- invalid vendor IDs
- stale referral verification

2. Add graceful fallback messages.

3. Ensure app still works if MLM API is offline.

4. Add logs where needed.

5. Audit all touched files for:
- unused imports
- broken typings
- state inconsistencies
- async issues
- navigation bugs

6. Ensure no existing features are broken.

After completion:
- Provide summary of all changed files.
- Explain final architecture briefly.