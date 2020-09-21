/**
 * Pong game by Jeyvan Viriya, 29802245 for Programming Paradigms Assignment 1 S2 2020
 */

import { fromEvent,interval} from 'rxjs'; 
import { map,filter,flatMap,takeUntil, merge} from 'rxjs/operators';

function pong() {
    // Inside this function you will use the classes and functions 
    // from rx.js
    // to add visuals to the svg element in pong.html, animate them, and make them interactive.
    // Study and complete the tasks in observable exampels first to get ideas.
    // Course Notes showing Asteroids in FRP: https://tgdwyer.github.io/asteroids/ 
    // You will be marked on your functional programming style
    // as well as the functionality that you implement.
    // Document your code!
    
    function Ball() {
      // gets the object with the id "canvas" and assigns it to svg
      const svg = document.getElementById("canvas")!;
      // gets the object with the id "userPaddle" and assigns it to user
      const user = document.getElementById("userPaddle")!;
      // gets the object with the id "comPaddle" and assigns it to com      
      const com = document.getElementById("comPaddle")!;
      // creates a new circle object
      const ball = document.createElementNS(svg.namespaceURI,'circle')
      Object.entries({
        // the following are the attributes for the "ball" object
        id: "ball",
        cx: 400, cy: 300,
        r: 5,
        fill: 'white',
      }).forEach(([key,val])=>ball.setAttribute(key,String(val))) // sets the before mentioned attributes to the object
      svg.appendChild(ball) // appends the object to the svg


      // the following codes are mentioned to creating new texts with their own attributes, including:
      // text to show Computer's score
      const comScoreBoard = document.createElementNS(svg.namespaceURI, 'text')
      Object.entries({
        id: "comScore",
        x :175, y : 100,
        "font-family" : 'sans-serif',
        "font-size" : '100px', fill : 'white',
      }).forEach(([key,val])=>comScoreBoard.setAttribute(key,String(val)))
      svg.appendChild(comScoreBoard)
      comScoreBoard.textContent = "0"; // which is initialized to 0 at start

      // the text to show that the computer has won
      const comWins = document.createElementNS(svg.namespaceURI, 'text')
      Object.entries({
        id: "comWins",
        x :90, y : 300,
        "font-family" : 'sans-serif',
        "font-size" : '125px', fill : 'white',
      }).forEach(([key,val])=>comWins.setAttribute(key,String(val)))
      svg.appendChild(comWins)

      // the text to show the user's score
      const userScoreBoard = document.createElementNS(svg.namespaceURI, 'text')
      Object.entries({
        id: "userScore",
        x :575, y : 100,
        "font-family" : 'sans-serif',
        "font-size" : '100px', fill : 'white',
      }).forEach(([key,val])=>userScoreBoard.setAttribute(key,String(val)))
      svg.appendChild(userScoreBoard)
      userScoreBoard.textContent = "0"; // also initialized to 0 at start

      // the text to show that the computer has won
      const userWins = document.createElementNS(svg.namespaceURI, 'text')
      Object.entries({
        id: "userWins",
        x :35, y : 300,
        "font-family" : 'sans-serif',
        "font-size" : '125px', fill : 'white',
      }).forEach(([key,val])=>userWins.setAttribute(key,String(val)))
      svg.appendChild(userWins)

      // the text to show that the user achieved a booster
      const luckyYou = document.createElementNS(svg.namespaceURI, 'text')
      Object.entries({
        id: "userWins",
        x :35, y : 300,
        "font-family" : 'sans-serif',
        "font-size" : '125px', fill : 'white',
      }).forEach(([key,val])=>luckyYou.setAttribute(key,String(val)))
      svg.appendChild(luckyYou)


      //the following are the attributes used in running the game (automated computer paddle and ball, text)
      let xVelocity = 1;
      let yVelocity = Math.random();
      let yMovement = 0.85;
      let userScore = 0;
      let comScore = 0;
      let chances = Math.random();

      // this is an numerical observable used to bounce the ball, given the condition that the ball hits either the user paddle or the com paddle,
      // then this observable will change the direction of the ball, which in this case is the variable xVelocity
      const changeXBallDirection = interval(15)
        .pipe(
          filter(_ => (Number(ball.getAttribute('cx')) <= (Number(com.getAttribute('x')) + Number(com.getAttribute('width'))) &&
                          Number(ball.getAttribute('cy')) >= (Number(com.getAttribute('y'))) &&
                          Number(ball.getAttribute('cy')) <= (Number(com.getAttribute('y')) + Number(com.getAttribute('height'))) 
                      ) || 
                      (Number(ball.getAttribute('cx')) >= Number(user.getAttribute('x'))) &&
                          Number(ball.getAttribute('cy')) >= (Number(user.getAttribute('y'))) &&
                          Number(ball.getAttribute('cy')) <= (Number(user.getAttribute('y')) + Number(user.getAttribute('height')))                          
                      )   
        )
        .subscribe(() => xVelocity *= -1);

      // this is an numerical observable used to bounce the ball, given the condition that the ball hits either the upper or lower wall,
      // then this observable will change the direction of the ball, which in this case is the variable yVelocity      
      const changeYBallDirection = interval(15)
        .pipe(
          filter(_ => Number(ball.getAttribute('cy')) <= 0 || Number(ball.getAttribute('cy')) >= 600)
        )
        .subscribe(() => yVelocity *= -1);
      
      // this is a numerical interval observable used to move the paddle up, where given the ball is on the upper range of the paddle, then
      // we would modify the y attribute of the com paddle into negative, moving the paddle up.
      const moveComPaddleUp = interval(7)
        .pipe(
          filter(_ => Number(com.getAttribute('y')) > (Number(ball.getAttribute('cy')) - Number(com.getAttribute('height'))/2))
        )
        .subscribe(()=>com.setAttribute('y', String((-1*yMovement) + Number(com.getAttribute('y')))));
      
      // this is a numerical interval observable used to move the paddle dpwm, where given the ball is on the lower range of the paddle, then
      // we would modify the y attribute of the com paddle into positive, moving the paddle down.
      const moveComPaddleDown = interval(7)
        .pipe(
          filter(_ => Number(com.getAttribute('y')) < (Number(ball.getAttribute('cy')) - Number(com.getAttribute('height'))/2))
        )
        .subscribe(()=>com.setAttribute('y', String(yMovement + Number(com.getAttribute('y')))));
      
        // this is an observable that is used to check is the user scores a goal (the ball touches the com's walls), then resets the game
        // (putting the ball back to the original position and recalculates the random value.)
      const updateScoreUser = interval(2500)
        .pipe(
          filter(() => Number(ball.getAttribute('cx')) <= 0)
        )
        .subscribe(() => {userScore += 1; userScoreBoard.textContent = String(userScore);
          ball.setAttribute('cx', "400"); ball.setAttribute('cy', "300"); chances = Math.random()})
        
      // this is an observable that is used to check is the user scores a goal (the ball touches the com's walls), then resets the game
      // (putting the ball back to the original position and recalculates the random value.)
      const updateScoreCom = interval(2500)
        .pipe(
          filter(() => Number(ball.getAttribute('cx')) >= 800)
        )
        .subscribe(() => {comScore += 1; comScoreBoard.textContent = String(comScore);
          ball.setAttribute('cx', "400"); ball.setAttribute('cy', "300"); chances = Math.random()})
      
      // this observable moves the ball around using the xVelocity and yVelocity variables given that both players have not reached 7 points
      // and that the ball is inside the arena.
      const animateX = interval(5)
        .pipe(
          filter(() => userScore < 7 && comScore < 7 && 0 < Number(ball.getAttribute('cx'))  && Number(ball.getAttribute('cx')) < 800 )
        )
        .subscribe(()=> {ball.setAttribute('cx', String(xVelocity + Number(ball.getAttribute('cx')))); 
                         ball.setAttribute('cy', String(yVelocity + Number(ball.getAttribute('cy'))));
                         });
      
      // this observable is used to tell the user if the com wins the game
      const comWinsAnimate = interval(5)
        .pipe(
          filter(()=> comScore == 7)
        )
        .subscribe(() => {comWins.textContent = "COM WINS"; luckyYou.textContent = "";})

      // this observable is used to tell the user if the user wins the game        
      const userWinsAnimate = interval(5)
        .pipe(
          filter(()=> userScore == 7)
        )
        .subscribe(() => {userWins.textContent = "USER WINS"; luckyYou.textContent = "";})
      
      // this observable is used to give the user a powerup (doubling the length of the paddle) when in the current round the random number generated is 
      // less that 0.25 (giving the users a 25 percent chance to gain this power up)
      const largerPaddle = interval(5)
        .pipe(
          filter(() => chances <= 0.25)
        )
        .subscribe(() => {user.setAttribute('height', String(100));
                          luckyYou.textContent = "LUCKY YOU"})

    }

    
    // the following function is used to control the user paddle, both by using keyboard (the w,a,s,d keys) and using mouse pointer.
    function userpaddleMovement() {
      // the following takes the user area (part of the area where the users could move their paddle) and the paddle itself.
      const userArea = document.getElementById("userArea")!;
      const userPaddle = document.getElementById("userPaddle")!; 

      // the following constants return observables from the MouseEvent, given are mousedown, mouse hovering, and mouseup.
      // the keyboard keys include w,a,s,d keydowns.
      const mousedown = fromEvent<MouseEvent>(userPaddle,'mousedown'),
            mousemove = fromEvent<MouseEvent>(userArea,'mousemove'),
            mouseup = fromEvent<MouseEvent>(userPaddle,'mouseup'),
            keyW$ = fromEvent<KeyboardEvent>(document, "keydown"),
            keyA$ = fromEvent<KeyboardEvent>(document, "keydown"),
            keyS$ = fromEvent<KeyboardEvent>(document, "keydown"),
            keyD$ = fromEvent<KeyboardEvent>(document, "keydown")
      
      // the following interacts with the mousedown observable, which includes:
      mousedown
        .pipe(
          // we map the clientX and clientY points to calculate the mousedown offsets for both x and y, which are security conditions for
          // when the pointer is out of range.
          map(({clientX, clientY}) => ({
           mouseDownXOffset: Number(userPaddle.getAttribute('x')) - clientX,
            mouseDownYOffset: Number(userPaddle.getAttribute('y')) - clientY
          })),
          // the function flatmap that applies the mousedown x and y offsets to the mouse move, for calculation of the postion for x and y 
          // coordinates of the paddle
          flatMap(({mouseDownXOffset, mouseDownYOffset}) =>
            mousemove
              .pipe(
                takeUntil(mouseup),
                map(({clientX, clientY}) => ({
                    x: clientX + mouseDownXOffset,
                   y: clientY + mouseDownYOffset
                  })))))
        // this function applies the calculated x and y coordinates to the x and y attributes of the paddle
        .subscribe(({x, y}) => {
          userPaddle.setAttribute('x', String(x))
          userPaddle.setAttribute('y', String(y))
        });
      
      // the following applies all the given keyboard keys with the intended functions.
      keyW$.pipe(
        filter(e=>e.key==='w'),
        map(_=>userPaddle.setAttribute('y', String(Number(userPaddle.getAttribute('y')) - 10))),
        merge(keyA$.pipe(
          filter(e=>e.key==='a'),
          map(_=>userPaddle.setAttribute('x', String(Number(userPaddle.getAttribute('x')) - 10))),
          merge(keyS$.pipe(
            filter(e=>e.key==='s'),
            map(_=>userPaddle.setAttribute('y', String(10 + Number(userPaddle.getAttribute('y'))))),
            merge(keyD$.pipe(
              filter(e=>e.key==='d'),
              map(_=>userPaddle.setAttribute('x', String(10 + Number(userPaddle.getAttribute('x')))))
            ))
          ))
        ))
      ).subscribe();
    }
    
    setTimeout(userpaddleMovement, 0);
    setTimeout(Ball, 0);

  }
  
  // the following simply runs your pong function on window load.  Make sure to leave it in place.
  if (typeof window != 'undefined')
    window.onload = ()=>{
      pong();
    }
  
  

