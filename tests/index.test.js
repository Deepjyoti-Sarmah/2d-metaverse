import { axios } from "axios";

const BACKEND_URL = "http://localhost:3000";

describe("Authentication", () => {
  test("User is able to sign up only once", async () => {
    const username = "deep" + Math.random();
    const password = "123456";

    const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "admin"
    });

    expect(response.statusCode).tobe(200);

    const updatedResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "admin"
    });

    expect(updatedResponse.statusCode).tobe(400);
  });

  test("Signup request fails if the username is empty", async () => {
    const username = `deep-${Math.random()}`;
    const password = "123456";

    const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      password
    });

    expect(response.statusCode).tobe(400);
  });

  test("Signin succeeds if the username and password are correct", async () => {
    const username = `deep-${Math.random()}`;
    const password = "123456";

    // sign up
    await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password
    });

    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username,
      password
    });

    expect(response.statusCode).tobe(200);
    expect(response.body.token).toBeDefined();
  });

  test("Signin fails if the username and password are incorrect", async () => {
    const username = `deep-${Math.random()}`
    const password = "123456";

    //sign up 
    await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password
    });

    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username: "deepppppp",
      password,
    });

    expect(response.statusCode).tobe(403);
  });
});

describe('User metadata endpoints', () => {
  let token = "";
  let avatarId = "";

  beforeAll(async () => {
    const username = `deep-${Math.random()}`;
    const password = "123456";

    await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "admin"
    });

    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username,
      password
    });

    token = response.body.token;

    const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
      "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
      "name": "Timmy"
    });

    avatarId = avatarResponse.data.avatarId;
  });

  test("User can't update there metadata with a wrong avatar id", async () => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, 
      {
        avatarId: "123333"
      }, {
        headers: {
          "authorization": `Bearer ${token}`
        }
      }
    );

    expect(response.statusCode).tobe(400);
  });

  test("User can update there metadata with a right avatar id", async () => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
      avatarId: avatarId
    }, {
        Headers: {
          "authorization": `Bearer ${token}`
        }
      });

    expect(response.statusCode).tobe(200);
  });

  test("User is not able to update their metadata if the auth is not present", async () => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
      avatarId: avatarId
    });
    expect(response.statusCode).tobe(403);
  });
});

describe('User avatar information', () => {
  let avatarId = "";
  let token = "";
  let userId = "";

  beforeAll(async () => {
    const username = `deep-${Math.random()}`;
    const password = "123456";

    const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type : "admin"
    });

    userId = signupResponse.data.userId;

    const response = await axios.post(`${BACKEND_URL}/api/v1/sigin`, {
      username,
      password
    });

    token = response.body.token;

    const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
      "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
      "name": "Timmy"
    });

    avatarId = avatarResponse.data.avatarId;
  });

  test("Get back avatar information for a user", async () => {
    const response = await axios.get(`${BACKEND_URL}/api/v1/user/metadata/bulk?ids=[${userId}]`);

    expect(response.data.avatars.length).tobe(1);
    expect(response.data.avatars[0].userId).tobe(userId);
  });

  test("Availabe avatar lists the recently created avatar", async () => {

  });

});
