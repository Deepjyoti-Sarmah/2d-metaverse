import { axios } from "axios";

const BACKEND_URL = "http://localhost:3000";
const WS_URL = "http://localhost:3001";

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
      type: "admin"
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
    }, {
      headers: {
        autherization: `Bearer ${adminId}`
      }
    });

    avatarId = avatarResponse.data.avatarId;
  });

  test("Get back avatar information for a user", async () => {
    const response = await axios.get(`${BACKEND_URL}/api/v1/user/metadata/bulk?ids=[${userId}]`);

    expect(response.data.avatars.length).tobe(1);
    expect(response.data.avatars[0].userId).tobe(userId);
  });

  test("Availabe avatar lists the recently created avatar", async () => {
    const response = axios.get(`${BACKEND_URL}/api/v1/avatars`);
    expect(response.data.avatars.length).not.tobe(0);

    const currentAvatar = response.data.avatars.find(x => x.id == avatarId);
    expect(currentAvatar).toBeDefined();
  });
});

describe('Space infromation', () => {
  let mapId;
  let element1Id;
  let element2Id;
  let adminId;
  let adminToken;
  let userId
  let userToken;

  beforeAll(async () => {
    const username = `deep-${Math.random()}`;
    const password = "123456";

    const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username: username + "-admin",
      password,
      type: "admin"
    });

    adminId = signupResponse.data.userId;

    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username: username + "-admin",
      password
    });

    adminToken = response.body.token;

    const element1 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
      "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
      "width": 1,
      "height": 1,
      "static": true
    }, {
      headers: {
        authorization: `Bearer ${adminToken}`
      }
    });


    const element2 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
      "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
      "width": 1,
      "height": 1,
      "static": true
    }, {
      headers: {
        authorization: `Bearer ${adminToken}`
      }
    });

    element1Id = element1.data.id;
    element2Id = element2.data.id;

    const map = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
      "thumbnail": "https://thumbnail.com/a.png",
      "dimensions": "100x200",
      "name": "100 person interview room",
      "defaultElements": [{
        elementId: element1Id,
        x: 20,
        y: 20
      }, {
        elementId: element1Id,
        x: 18,
        y: 20
      }, {
        elementId: element2Id,
        x: 19,
        y: 20
      }
      ]
    }, {
      headers: {
        autherization: `Bearer ${adminToken}`
      }
    });

    mapId = map.id;

    const userSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "user"
    });

    userId = userSignupResponse.data.userId;

    const userSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username,
      password
    });

    userToken = userSigninResponse.body.token;
  });

  test("User is able to create a space with mapId", async () => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
      "name": "Test",
      "dimensions": "100x200",
      "mapId": mapId
    }, {
      headers: {
        autherization: `Bearer ${userToken}`
      }
    });

    expect(response.data.spaceId).toBeDefined();
  });

  test("User is able to create a space without mapId (empty space)", async () => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
      "name": "Test",
      "dimensions": "100x200",
    }, {
      headers: {
        autherization: `Bearer ${userToken}`
      }
    });

    expect(response.data.spaceId).toBeDefined();
  });

  test("User is not able to create a space without mapId and dimensions", async () => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
      "name": "Test",
    }, {
      headers: {
        autherization: `Bearer ${userToken}`
      }
    });

    expect(response.statusCode).tobe(400);
  });

  test("User is not able to delete a space that doesn't exists", async () => {
    const response = await axios.delete(`${BACKEND_URL}/api/v1/space/randomIdDoesntExist`, {
      headers: {
        autherization: `Bearer ${userToken}`
      }
    });

    expect(response.statusCode).tobe(400);
  });

  test("User is able to delete a space that does exists", async () => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
      "name": "Test",
      "dimensions": "100x200",
    }, {
      headers: {
        autherization: `Bearer ${userToken}`
      }
    });

    const deleteResponse = await axios.delete(`${BACKEND_URL}/api/v1/space/${response.data.spaceId}`, {
      headers: {
        autherization: `Bearer ${userToken}`
      }
    });

    expect(deleteResponse.statusCode).tobe(200);
  });

  test("User should not be able to delete a space from another user", async () => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
      "name": "Test",
      "dimensions": "100x200",
    }, {
      headers: {
        autherization: `Bearer ${userToken}`
      }
    });

    const deleteResponse = await axios.delete(`${BACKEND_URL}/api/v1/space/${response.data.spaceId}`, {
      headers: {
        autherization: `Bearer ${adminToken}`
      }
    });

    expect(deleteResponse.statusCode).tobe(403);
  });

  test("Admin has no space initially", async () => {
    const response = axios.get(`${BACKEND_URL}/api/v1/space/all`, {
      headers: {
        autherization: `Bearer ${adminToken}`
      }
    });
    expect(response.data.spaces.length).tobe(0);
  });

  test("Admin has gets once space after", async () => {
    const spaceCreateResponse = axios.post(`${BACKEND_URL}/api/v1/space/`, {
      "name": "Test",
      "dimensions": "100x200",
    }, {
      headers: {
        autherization: `Bearer ${adminToken}`
      }
    });

    const response = await axios.get(`${BACKEND_URL}/api/v1/space/all`, {
      headers: {
        autherization: `Bearer ${adminToken}`
      }
    });

    const filteredSpace = response.data.spaces.find(x => x.id == spaceCreateResponse.spaceId);

    expect(response.data.spaces.length).tobe(1);
    expect(filteredSpace).toBeDefined();
  });
});

describe("Arena endpoints", () => {
  let mapId;
  let element1Id;
  let element2Id;
  let adminId;
  let adminToken;
  let userId
  let userToken;
  let spaceId;

  beforeAll(async () => {
    const username = `deep-${Math.random()}`;
    const password = "123456";

    const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username: username + "-admin",
      password,
      type: "admin"
    });

    adminId = signupResponse.data.userId;

    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username: username + "-admin",
      password
    });

    adminToken = response.body.token;

    const element1Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
      "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
      "width": 1,
      "height": 1,
      "static": true
    }, {
      headers: {
        authorization: `Bearer ${adminToken}`
      }
    });

    const element2Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
      "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
      "width": 1,
      "height": 1,
      "static": true
    }, {
      headers: {
        authorization: `Bearer ${adminToken}`
      }
    });

    element1Id = element1Response.data.id;
    element2Id = element2Response.data.id;

    const map = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
      "thumbnail": "https://thumbnail.com/a.png",
      "dimensions": "100x200",
      "name": "100 person interview room",
      "defaultElements": [{
        elementId: element1Id,
        x: 20,
        y: 20
      }, {
        elementId: element1Id,
        x: 18,
        y: 20
      }, {
        elementId: element2Id,
        x: 19,
        y: 20
      }
      ]
    }, {
      headers: {
        autherization: `Bearer ${adminToken}`
      }
    });

    mapId = map.id;

    const userSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "user"
    });

    userId = userSignupResponse.data.userId;

    const userSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username,
      password
    });

    userToken = userSigninResponse.data.token;

    const space = await axios.post(`${BACKEND_URL}/api/v-1/`, {
      "name": "Test",
      "dimensions": "98x200",
      "mapId": mapId
    }, {
      headers: {
        authorization: `Bearer ${userToken}`
      }
    });

    spaceId = space.spaceId;
  });

  test("Incorrect spaceId returns a 400", async () => {
    const response = axios.get(`${BACKEND_URL}/api/v1/space/123444`, {
      headers: {
        autherization: `Bearer ${userToken}`
      }
    });
    expect(response.statusCode).tobe(400);
  });


  test("Correct spaceId returns all the elements", async () => {
    const response = axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
      headers: {
        autherization: `Bearer ${userToken}`
      }
    });
    expect(response.data.dimensions).tobe("98x200");
    expect(response.data.elements.length).tobe(3);
  });

  test("Delete element is able to delete an element", async () => {
    const spaceResponse = axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
      headers: {
        autherization: `Bearer ${userToken}`
      }
    });

    await axios.delete(`${BACKEND_URL}/api/v1/space/element`, {
      spaceId: spaceId,
      elementId: spaceResponse.data.elements[0].id
    }, {
      headers: {
        autherization: `Bearer ${userToken}`
      }
    });

    const newResponse = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
      headers: {
        autherization: `Bearer ${userToken}`
      }
    });

    expect(newResponse.data.elements.length).tobe(2);
  });

  test("Adding an element fails if element  liew outside the dimensions", async () => {

    await axios.post(`${BACKEND_URL}/api/v1/space/element`, {
      "elementId": element1Id,
      "spaceId": spaceId,
      "x": 50000,
      "y": 20000
    }, {
      headers: {
        autherization: `Bearer ${userToken}`
      }
    });

    const newResponse = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
      headers: {
        autherization: `Bearer ${userToken}`
      }
    });

    expect(newResponse.statusCode).tobe(400);
  });

  test("Adding an element works as expectes", async () => {

    await axios.post(`${BACKEND_URL}/api/v1/space/element`, {
      "elementId": element1Id,
      "spaceId": spaceId,
      "x": 50,
      "y": 20
    }, {
      headers: {
        autherization: `Bearer ${userToken}`
      }
    });

    const newResponse = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
      headers: {
        autherization: `Bearer ${userToken}`
      }
    });

    expect(newResponse.data.elements.length).tobe(3);
  });
});

describe("Admin endpoints", () => {
  let adminId;
  let adminToken;
  let userId
  let userToken;

  beforeAll(async () => {
    const username = `deep-${Math.random()}`;
    const password = "123456";

    const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username: username + "-admin",
      password,
      type: "admin"
    });

    adminId = signupResponse.data.userId;

    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username: username + "-admin",
      password
    });

    adminToken = response.body.token;

    const userSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "user"
    });

    userId = userSignupResponse.data.userId;

    const userSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username,
      password
    });

    userToken = userSigninResponse.body.token;
  });

  test("User is not able to hit admin Endpoints", async () => {
    //admin created element
    let elementId;

    const adminelementResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
      "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
      "width": 1,
      "height": 1,
      "static": true
    }, {
      headers: {
        authorization: `Bearer ${adminToken}`
      }
    });

    elementId = adminelementResponse.id;

    const elementResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
      "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
      "width": 1,
      "height": 1,
      "static": true
    }, {
      headers: {
        authorization: `Bearer ${userToken}`
      }
    });

    const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
      "thumbnail": "https://thumbnail.com/a.png",
      "dimensions": "100x200",
      "name": "100 person interview room",
      "defaultElements": []
    }, {
      headers: {
        autherization: `Bearer ${userToken}`
      }
    });

    const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
      "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
      "name": "Timmy"
    }, {
      headers: {
        autherization: `Bearer ${userToken}`
      }
    });

    const updateElementResponse = await axios.put(`${BACKEND_URL}/api/v1/admin/element/${elementId}`, {
      "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE"
    }, {
      headers: {
        autherization: `Bearer ${userToken}`
      }
    });

    expect(elementResponse.statusCode).tobe(403);
    expect(mapResponse.statusCode).tobe(403);
    expect(avatarResponse.statusCode).tobe(403);
    expect(updateElementResponse.statusCode).tobe(403);

  });

  test("Admin is able to hit admin Endpoints", async () => {
    //admin created element
    let elementId;

    const adminelementResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
      "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
      "width": 1,
      "height": 1,
      "static": true
    }, {
      headers: {
        authorization: `Bearer ${adminToken}`
      }
    });

    elementId = adminelementResponse.data.id;

    const elementResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
      "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
      "width": 1,
      "height": 1,
      "static": true
    }, {
      headers: {
        authorization: `Bearer ${adminToken}`
      }
    });

    const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
      "thumbnail": "https://thumbnail.com/a.png",
      "dimensions": "100x200",
      "name": "100 person interview room",
      "defaultElements": []
    }, {
      headers: {
        autherization: `Bearer ${adminToken}`
      }
    });

    const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
      "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
      "name": "Timmy"
    }, {
      headers: {
        autherization: `Bearer ${adminToken}`
      }
    });

    const updateElementResponse = await axios.put(`${BACKEND_URL}/api/v1/admin/element/${elementId}`, {
      "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE"
    }, {
      headers: {
        autherization: `Bearer ${adminToken}`
      }
    });

    expect(elementResponse.statusCode).tobe(200);
    expect(mapResponse.statusCode).tobe(200);
    expect(avatarResponse.statusCode).tobe(200);
    expect(updateElementResponse.statusCode).tobe(403);
  });

  test("Admin is able to update the image url for an element", async () => {
    //admin created element
    let elementId;

    const adminelementResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
      "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
      "width": 1,
      "height": 1,
      "static": true
    }, {
      headers: {
        authorization: `Bearer ${adminToken}`
      }
    });

    elementId = adminelementResponse.data.id;

    const updateElementResponse = await axios.put(`${BACKEND_URL}/api/v1/admin/element/${elementId}`, {
      "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE"
    }, {
      headers: {
        autherization: `Bearer ${adminToken}`
      }
    });
    expect(updateElementResponse.statusCode).tobe(200);
  });
});

describe("Websocket tests", () => {
  let adminId;
  let adminToken;
  let userId;
  let userToken;
  let element1Id;
  let element2Id;
  let mapId;
  let spaceId;
  let ws1;
  let ws2;
  let ws1Messages = [];
  let ws2Messages = [];
  let userX;
  let userY;
  let adminX;
  let adminY;

  function waitForAndPopLatestMessage(messageArray) {
    return new Promise(r => {
      if (messageArray.length > 0) {
        resolve(messageArray.shift());
      } else {
        let interval = setTimeout(() => {
          if (messageArray.length > 0) {
            resolve(messageArray.shift());
            clearInterval(interval);
          }
        }, 100)
      }
    })
  }

  async function setUpHTTP() {
    const username = `deep-${Math.random()}`;
    const password = "123456";

    const adminSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username: username + "-admin",
      password,
      type: "admin"
    });

    const adminSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username: username + "-admin",
      password,
    });

    adminId = adminSignupResponse.data.userId;
    adminToken = adminSigninResponse.data.token;

    const userSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
    });

    const userSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
    });

    userId = userSigninResponse.data.userId;
    userToken = userSignupResponse.data.token;


    const element1Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
      "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
      "width": 1,
      "height": 1,
      "static": true
    }, {
      headers: {
        authorization: `Bearer ${adminToken}`
      }
    });

    const element2Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
      "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
      "width": 1,
      "height": 1,
      "static": true
    }, {
      headers: {
        authorization: `Bearer ${adminToken}`
      }
    });

    element1Id = element1Response.data.id;
    element2Id = element2Response.data.id;

    const map = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
      "thumbnail": "https://thumbnail.com/a.png",
      "dimensions": "100x200",
      "name": "100 person interview room",
      "defaultElements": [{
        elementId: element1Id,
        x: 20,
        y: 20
      }, {
        elementId: element1Id,
        x: 18,
        y: 20
      }, {
        elementId: element2Id,
        x: 19,
        y: 20
      }
      ]
    }, {
      headers: {
        autherization: `Bearer ${adminToken}`
      }
    });

    mapId = map.id;

    const space = await axios.post(`${BACKEND_URL}/api/v-1/`, {
      "name": "Test",
      "dimensions": "98x200",
      "mapId": mapId
    }, {
      headers: {
        authorization: `Bearer ${userToken}`
      }
    });

    spaceId = space.spaceId;
  }

  async function setUpWS() {
    ws1 = new WebSocket(WS_URL);

    await new Promise(r => {
      ws1.onopen = r
    })

    ws1.onmessage = (event) => {
      ws1Messages.push(JSON.parse(event.data));
    }


    ws2 = new WebSocket(WS_URL);

    await new Promise(r => {
      ws2.onopen = r
    })

    ws2.onmessage = (event) => {
      ws2Messages.push(JSON.parse(event.data));
    }
  }

  beforeAll(async () => {
    setUpHTTP()
    setUpWS()
  });

  test("Get back ack for joining the space", async () => {

    ws1.send(JSON.stringify({
      "type": "join",
      "payload": {
        "spaceId": spaceId,
        "token": adminToken
      }
    }))
    const message1 = await waitForAndPopLatestMessage(ws1Messages);

    ws2.send(JSON.stringify({
      "type": "join",
      "payload": {
        "spaceId": spaceId,
        "token": userToken
      }
    }))
    const message2 = await waitForAndPopLatestMessage(ws2Messages);

    const message3 = await waitForAndPopLatestMessage(ws1Messages);

    expect(message1.type).tobe("space-joined");
    expect(message2.type).tobe("space-joined");

    expect(message1.payload.user.length).tobe(0);
    expect(message2.payload.user.length).tobe(1);
    expect(message3.type).tobe("user-join");
    expect(message3.payload.x).tobe(message2.payload.spawn.x);
    expect(message3.payload.y).tobe(message2.payload.spawn.y);
    expect(message3.payload.userId).tobe(userId);

    adminX = message1.payload.spawn.x;
    adminY = message1.payload.spawn.y;

    userX = message2.payload.spawn.x;
    userY = message2.payload.spawn.y;
  });

  test("User should not be able to move accross the boundary of the wall", async () => {

    ws1.send(JSON.parse({
      type: "movement",
      payload: {
        x: 1022020,
        y: 10220
      }
    }));

    const message = await waitForAndPopLatestMessage(ws1Messages);
    expect(message.type).tobe("movement-rejected");
    expect(message.payload.x).tobe(adminX);
    expect(message.payload.y).tobe(adminY);
  });

  test("Correct movement should be broadcasted to the other socket in the room", async () => {

    ws1.send(JSON.parse({
      type: "movement",
      payload: {
        x: adminX + 1,
        y: adminY,
        userId: adminId
      }
    }));

    const message = await waitForAndPopLatestMessage(ws2Messages);
    expect(message.type).tobe("movement");
    expect(message.payload.x).tobe(adminX + 1);
    expect(message.payload.y).tobe(adminY);
  });

  test("If a user leaves the other user receives a leave event ", async () => {

    ws1.close()

    const message = await waitForAndPopLatestMessage(ws2Messages);
    expect(message.type).tobe("user-left");
    expect(message.payload.userId).tobe(adminId);
  });
});