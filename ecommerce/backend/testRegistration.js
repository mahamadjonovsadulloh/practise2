const bcrypt = require('bcryptjs');
const User = require('./models/User');
const { registerUser } = require('./controllers/authController');

async function runRegistrationVerification() {
  console.log('====================================================');
  console.log('🧪 RUNNING REGISTRATION VERIFICATION TESTS');
  console.log('====================================================');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Test User Schema Validations
  console.log('\n--- Test Suite 1: Mongoose User Model Validations ---');

  // 1.1 Missing name
  const userMissingName = new User({ email: 'test@example.com', password: 'password123' });
  const valErrorName = userMissingName.validateSync();
  assert(
    valErrorName?.errors?.name !== undefined,
    'User model rejects missing name'
  );

  // 1.2 Missing email
  const userMissingEmail = new User({ name: 'John Doe', password: 'password123' });
  const valErrorEmail = userMissingEmail.validateSync();
  assert(
    valErrorEmail?.errors?.email !== undefined,
    'User model rejects missing email'
  );

  // 1.3 Invalid email format
  const userBadEmail = new User({ name: 'John Doe', email: 'not-an-email', password: 'password123' });
  const valErrorBadEmail = userBadEmail.validateSync();
  assert(
    valErrorBadEmail?.errors?.email !== undefined,
    'User model rejects invalid email format'
  );

  // 1.4 Short password (< 6 chars)
  const userShortPass = new User({ name: 'John Doe', email: 'john@example.com', password: '123' });
  const valErrorShortPass = userShortPass.validateSync();
  assert(
    valErrorShortPass?.errors?.password !== undefined,
    'User model rejects short password (< 6 chars)'
  );

  // 1.5 Valid user schema validation
  const validUser = new User({
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    password: 'securePassword123',
  });
  const valSuccess = validUser.validateSync();
  assert(valSuccess === undefined, 'User model validates correct input data successfully');

  // 2. Test Password Hashing & Security Methods
  console.log('\n--- Test Suite 2: Password Hashing & Data Sanitization ---');

  // Simulate pre-save hook behavior
  const plainPassword = 'mySecretPassword123';
  const salt = await bcrypt.genSalt(10);
  validUser.password = await bcrypt.hash(plainPassword, salt);

  assert(
    validUser.password.startsWith('$2a$') || validUser.password.startsWith('$2b$'),
    'Password is hashed using bcrypt algorithm (starts with $2a$ or $2b$)'
  );

  assert(
    validUser.password !== plainPassword,
    'Password is never stored in plain text'
  );

  const isMatch = await validUser.matchPassword(plainPassword);
  assert(isMatch === true, 'matchPassword() accurately validates correct plain text password');

  const isWrongMatch = await validUser.matchPassword('wrongPassword!');
  assert(isWrongMatch === false, 'matchPassword() accurately rejects incorrect password');

  // Test toJSON() does not leak password hash
  const jsonOutput = validUser.toJSON();
  assert(
    jsonOutput.password === undefined,
    'toJSON() strips password hash from output (security protection against data leak)'
  );
  assert(
    jsonOutput.email === 'jane.doe@example.com' && jsonOutput.name === 'Jane Doe',
    'toJSON() preserves non-sensitive user attributes'
  );

  // 3. Test Controller Request Validation Handlers
  console.log('\n--- Test Suite 3: Controller Input Validation & Status Codes ---');

  function createMockRes() {
    return {
      statusCode: null,
      jsonData: null,
      cookies: {},
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        this.jsonData = data;
        return this;
      },
      cookie(name, val, opts) {
        this.cookies[name] = { val, opts };
      },
    };
  }

  // 3.1 Missing name in request
  const mockReqNoName = { body: { email: 'a@b.com', password: 'password123' } };
  const mockResNoName = createMockRes();
  await registerUser(mockReqNoName, mockResNoName);
  assert(
    mockResNoName.statusCode === 400 && mockResNoName.jsonData?.success === false,
    'registerUser controller returns HTTP 400 when name is missing'
  );

  // 3.2 Missing email in request
  const mockReqNoEmail = { body: { name: 'Alice', password: 'password123' } };
  const mockResNoEmail = createMockRes();
  await registerUser(mockReqNoEmail, mockResNoEmail);
  assert(
    mockResNoEmail.statusCode === 400 && mockResNoEmail.jsonData?.success === false,
    'registerUser controller returns HTTP 400 when email is missing'
  );

  // 3.3 Invalid email in request
  const mockReqBadEmail = { body: { name: 'Alice', email: 'alice-without-at', password: 'password123' } };
  const mockResBadEmail = createMockRes();
  await registerUser(mockReqBadEmail, mockResBadEmail);
  assert(
    mockResBadEmail.statusCode === 400 && mockResBadEmail.jsonData?.message?.includes('valid email'),
    'registerUser controller returns HTTP 400 with friendly message for invalid email'
  );

  // 3.4 Short password in request
  const mockReqShortPass = { body: { name: 'Alice', email: 'alice@example.com', password: '123' } };
  const mockResShortPass = createMockRes();
  await registerUser(mockReqShortPass, mockResShortPass);
  assert(
    mockResShortPass.statusCode === 400 && mockResShortPass.jsonData?.message?.includes('6 characters'),
    'registerUser controller returns HTTP 400 when password is under 6 characters'
  );

  console.log('\n====================================================');
  console.log(`VERIFICATION SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runRegistrationVerification().catch((err) => {
  console.error('Test run failed:', err);
  process.exit(1);
});

