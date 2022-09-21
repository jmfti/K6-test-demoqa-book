// Creator: WebInspector 537.36

import { sleep, group } from 'k6'
import http from 'k6/http'
import { SharedArray } from 'k6/data';


// define the scenario we are running. a ramping-vus that will load users in a linear fashion, a stable stage and a step rampdown
export const options = {
  scenarios: {
    demoqabook: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: __ENV.TARGET },
        { duration: '2m', target: 0 },
        { duration: '1s', target: 0 },
      ],
    },
  },
}

// get configuration properties
const profile = new SharedArray("profile", function(){
  return [JSON.parse(open("./config/profiles.json"))[__ENV.profile]];
})

// var profiles = open("./config/profiles.json");
// var profile = profiles[__ENV.profile];
// console.log(profile)
// console.log(profile);
// load json from file

export default function main() {
  // we will need books sessionData to get token and other things. Cookie is built with the sessionData
  let response, cookie, books, sessionData;
  // a group for grouping the Login steps
  group('Login', function () {
    // a group for the GenerateToken request
    group('GenerateToken - https://demoqa.com/Account/v1/GenerateToken', function () {
      response = http.post(
        'https://demoqa.com/Account/v1/GenerateToken',
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
        }
      )
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
        }
      )
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
      })
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
    });
    
    // get the list of books to be used in the next transaction
    books = response.json().books;

    
  })
  // a transaction for adding a book to the cart, it has a probability of 0.5, so Logins, in average, will double the books added to cart
  group('add_random_book', function () {
    // add a random book with a probability of 0.5
    if (Math.random() >= 0.5) {
      return;
    }
    // I don't know what is this request for but doesn't seem to be needed
    // response = http.get('https://demoqa.com/books?book=${randomBook.isbn}`, {
    //   headers: {
    //     Accept:
    //       'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    //     'Accept-Encoding': 'gzip, deflate, br',
    //     'Accept-Language': 'es-ES,es;q=0.9',
    //     Connection: 'keep-alive',
    //     Cookie:
    //       cookie,
    //     Host: 'demoqa.com',
    //     Referer: 'https://demoqa.com/books',
    //     'Sec-Fetch-Dest': 'document',
    //     'Sec-Fetch-Mode': 'navigate',
    //     'Sec-Fetch-Site': 'same-origin',
    //     'Sec-Fetch-User': '?1',
    //     'Upgrade-Insecure-Requests': '1',
    //     'User-Agent':
    //       'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
    //     'sec-ch-ua': '"Google Chrome";v="105", "Not)A;Brand";v="8", "Chromium";v="105"',
    //     'sec-ch-ua-mobile': '?0',
    //     'sec-ch-ua-platform': '"Windows"',
    //   },
    // })

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
    })
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
        }
      )
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
      })
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
        }
      )
    }

    

  }); // end delete all books
  sleep(60) // sleep for 60 seconds, so 1 vuser will be 1 req/min
}
