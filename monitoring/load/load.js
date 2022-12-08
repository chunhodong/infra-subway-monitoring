import http from 'k6/http';
import { check, group, sleep, fail } from 'k6';

export let options = {
    stages: [
        {duration: '1m', target: 1},
        {duration: '2m', target: 3},
        {duration: '4m', target: 5},
        {durtaion: '2m', target: 3},
        {durtaion: '1m', target: 1},
        {duration: '10s', target: 0},
    ],
    thresholds: {
        http_req_duration: ['p(99)<1000'],
    },
};

const BASE_URL = 'https://chunhodong.p-e.kr/';
const USERNAME = 'test@test.com';
const PASSWORD = 'password';

export default function ()  {
    main();
    const authHeaders = login();
    authMember(authHeaders);
    path();
    findPath(authHeaders);
    sleep(1);
}


function main() {
    const response = http.get(BASE_URL);

    check(response, {
        'main status 200': (res) => res.status === 200
    });
}

function login() {
    const payload = JSON.stringify({
        email: USERNAME,
        password: PASSWORD,
    });
    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const response = http.post(`${BASE_URL}/login/token`, payload, params);

    check(response, {
        'logged in successfully': (res) => res.json('accessToken') !== '',
    });

    return {
        headers: {
            Authorization: `Bearer ${response.json('accessToken')}`,
        },
    };
}

function authMember(authHeaders) {
    let myObjects = http.get(`${BASE_URL}/members/me`, authHeaders).json();
    check(myObjects, { 'retrieved member': (obj) => obj.id != 0 });
}

function path() {
    const response = http.get(`${BASE_URL}/path`);

    check(response, {
        'path status 200': (res) => res.status === 200
    });
}

function findPath(authHeaders) {
    const response = http.get(`${BASE_URL}/path?source=7&target=395`, authHeaders);

    check(response, {
        'find path status 200': (res) => res.status === 200
    });
}