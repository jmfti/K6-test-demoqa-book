// Creator: WebInspector 537.36

import { sleep, group } from 'k6'
import http from 'k6/http'
import { SharedArray } from 'k6/data';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { Trend } from 'k6/metrics';
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

export function handleSummary(data) {
  return {
    "result.html": htmlReport(data),
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  };
}

const generateTokenTrend = new Trend('GenerateToken');
const getUsersTrend = new Trend('GetUsers');
const loginTrend = new Trend('Login');
const userProfileTrend = new Trend('UserProfile');
const listBooksTrend = new Trend('ListBooks');
const getBookInfoTrend = new Trend('GetBookInfo');
const addBookTrend = new Trend('AddBook');
const deleteBookTrend = new Trend('DeleteBook');



// define the scenario we are running. a ramping-vus that will load users in a linear fashion, a stable stage and a step rampdown
export const options = {
  scenarios: {
    demoqabook: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: __ENV.TARGET },
        { duration: '20s', target: 0 },
        { duration: '1s', target: 0 },
      ],
    },
  },
}


// get configuration properties
const profile = new SharedArray("profile", function(){
  let profiles = {
      "dev": {
          "user": "Test_jmfti01",
          "pwd": "Test_jmfti01!:" // this should be obviously secretized
      }
  }

  return [profiles[__ENV.profile]];
})


export default function main() {
  // we will need books sessionData to get token and other things. Cookie is built with the sessionData
  let response, cookie, books, sessionData;
  // a group for grouping the Login steps
  group('Login', function () {
    // a group for the GenerateToken request
    group('GenerateToken - https://demoqa.com/Account/v1/GenerateToken', function () {
      response = http.post(
        'https://demoqa.com/Account/v1/GenerateToken',  // endpoints should be get from the config file, to make simple ${endpoint}/GenerateToken
        `{"userName":"${profile[0].user}","password":"${profile[0].pwd}"}`,
        {
          headers: {
            Accept: 'application/json',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'es-ES,es;q=0.9',
            Connection: 'keep-alive',
            'Content-Type': 'application/json',
            Host: 'demoqa.com',
            Origin: 'https://demoqa.com',
            Referer: 'https://demoqa.com/login',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
            'sec-ch-ua': '"Google Chrome";v="105", "Not)A;Brand";v="8", "Chromium";v="105"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
          },
          tags: { name: 'GenerateToken' },
        }
      )
      generateTokenTrend.add(response.timings.duration);  // add response times statistics grouped by method
    }); // end GenerateToken
    // login step
    group('LoginStep - https://demoqa.com/Account/v1/Login', function () {
      response = http.post(
        'https://demoqa.com/Account/v1/Login',
        `{"userName":"${profile[0].user}","password":"${profile[0].pwd}"}`,
        {
          headers: {
            Accept: 'application/json',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'es-ES,es;q=0.9',
            Connection: 'keep-alive',
            'Content-Type': 'application/json',
            Host: 'demoqa.com',
            Origin: 'https://demoqa.com',
            Referer: 'https://demoqa.com/login',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
            'sec-ch-ua': '"Google Chrome";v="105", "Not)A;Brand";v="8", "Chromium";v="105"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
          },
          tags: { name: 'Login' },
        }
      )
      loginTrend.add(response.timings.duration);
    }); // end Login
    // recover sessionData from response and build the cookie we need
    sessionData = response.json();
    // console.log(sessionData);
    cookie = `token=${sessionData.token}; expires=${sessionData.expires}; userID=${sessionData.userId}; userName=${sessionData.username}`;
    // access to user profile, which is part of the flow
    group(`UserProfile - https://demoqa.com/Account/v1/User/${sessionData.userId}`, function () {
      response = http.get(`https://demoqa.com/Account/v1/User/${sessionData.userId}`, {
        headers: {
          Accept: '*/*',
          'Accept-Encoding': 'gzip, deflate, br',
          'Accept-Language': 'es-ES,es;q=0.9',
          Authorization:
            `Bearer ${sessionData.token}`,
          Connection: 'keep-alive',
          'Content-Type': 'application/json',
          Cookie:
            cookie,
          Host: 'demoqa.com',
          // 'If-None-Match': 'W/"4e2-twitz3/ySt6fBW+wRvr4H7ojC4c"',  
          Referer: 'https://demoqa.com/profile',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
          'sec-ch-ua': '"Google Chrome";v="105", "Not)A;Brand";v="8", "Chromium";v="105"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
        },
        tags: { name: 'UserProfile' },
      })
      userProfileTrend.add(response.timings.duration);
    }); // end UserProfile
  }); // end Login
  // a transaction for listing books
  group('List Books - https://demoqa.com/BookStore/v1/Books', function () {
    response = http.get('https://demoqa.com/BookStore/v1/Books', {
      headers: {
        Accept: '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'es-ES,es;q=0.9',
        Connection: 'keep-alive',
        Cookie:
          cookie,
        Host: 'demoqa.com',
        // 'If-None-Match': 'W/"11a2-8zfX++QwcgaCjSU6F8JP9fUd1tY"',
        Referer: 'https://demoqa.com/books',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
        'sec-ch-ua': '"Google Chrome";v="105", "Not)A;Brand";v="8", "Chromium";v="105"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
      },
      tags: { name: 'ListBooks' },
    });
    listBooksTrend.add(response.timings.duration);
    // get the list of books to be used in the next transaction
    books = response.json().books;

    
  })
  // a transaction for adding a book to the cart, it has a probability of 0.5, so Logins, in average, will double the books added to cart
  group('add_random_book', function () {
    // add a random book with a probability of 0.5
    if (Math.random() >= 0.5) {
      return;
    }
    

    // get a random book and add it to the cart
    let randomBook = books[parseInt(Math.random() * books.length)];
    // get book details
    group(`GetBookInfo - https://demoqa.com/BookStore/v1/Book?ISBN=<randomBook.isbn>`, function () {
    
      response = http.get(`https://demoqa.com/BookStore/v1/Book?ISBN=${randomBook.isbn}`, {
      headers: {
        Accept: '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'es-ES,es;q=0.9',
        Connection: 'keep-alive',
        Cookie:
          cookie,
        Host: 'demoqa.com',
        Referer: `https://demoqa.com/books?book=${randomBook.isbn}`,
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
        'sec-ch-ua': '"Google Chrome";v="105", "Not)A;Brand";v="8", "Chromium";v="105"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
      },
      tags: { name: 'GetBookInfo' },
    })
    getBookInfoTrend.add(response.timings.duration);
    }); // end get book info
  
    // add the book to the cart
    group('add_book_to_cart - https://demoqa.com/BookStore/v1/Books', function () {
      response = http.post(
        'https://demoqa.com/BookStore/v1/Books',
        `{"userId":"${sessionData.userId}","collectionOfIsbns":[{"isbn":"${randomBook.isbn}"}]}`,
        {
          headers: {
            Accept: '*/*',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'es-ES,es;q=0.9',
            Authorization:
            `Bearer ${sessionData.token}`,
            Connection: 'keep-alive',
            'Content-Type': 'application/json',
            Cookie:
              cookie,
            Host: 'demoqa.com',
            Origin: 'https://demoqa.com',
            Referer: `https://demoqa.com/books?book=${randomBook.isbn}`,
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
            'sec-ch-ua': '"Google Chrome";v="105", "Not)A;Brand";v="8", "Chromium";v="105"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
          },
          tags: { name: 'add_book_to_cart' },
        }
      )
      addBookTrend.add(response.timings.duration);
    }); // end add book to cart
  })  // end add random book
  // proceed to get to our cart and remove any element we have
  group('delete all books', function () {
    group(`UserProfile - https://demoqa.com/Account/v1/User/${sessionData.userId}`, function () {
      // get list of books in our cart
      response = http.get(`https://demoqa.com/Account/v1/User/${sessionData.userId}`, {
        headers: {
          Accept: '*/*',
          'Accept-Encoding': 'gzip, deflate, br',
          'Accept-Language': 'es-ES,es;q=0.9',
          Authorization:
          `Bearer ${sessionData.token}`,
          Connection: 'keep-alive',
          'Content-Type': 'application/json',
          Cookie:
            cookie,
          Host: 'demoqa.com',
          // 'If-None-Match': 'W/"56-SAq+UVLSn4YL4SukcP24awjM+VM"',
          Referer: 'https://demoqa.com/profile',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
          'sec-ch-ua': '"Google Chrome";v="105", "Not)A;Brand";v="8", "Chromium";v="105"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
        },
        tags: { name: 'UserProfile' },
      })
      userProfileTrend.add(response.timings.duration);
    }); // end get user profile
    if (!response.body.match(/.+/)){
      // if there aren't any books in cart just pass
      return;
    }
    if (!("books" in response.json()))
      return;
    let booksInCart = response.json().books;
    // iterate over all books in cart and delete them
    for (let book of booksInCart) {
      let item = {isbn: book.isbn, userId: sessionData.userId};
      response = http.del(
        'https://demoqa.com/BookStore/v1/Book',
        JSON.stringify(item),
        {
          headers: {
            Accept: 'application/json',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'es-ES,es;q=0.9',
            Authorization:
            `Bearer ${sessionData.token}`,
            Connection: 'keep-alive',
            'Content-Type': 'application/json',
            Cookie:
              cookie,
            Host: 'demoqa.com',
            Origin: 'https://demoqa.com',
            Referer: 'https://demoqa.com/profile',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
            'sec-ch-ua': '"Google Chrome";v="105", "Not)A;Brand";v="8", "Chromium";v="105"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
          },
          tags: { name: 'delete_book' },
        }
      )
      deleteBookTrend.add(response.timings.duration);
    }

    

  }); // end delete all books
  sleep(1) // sleep for 60 seconds, so 1 vuser will be 1 req/min
}
