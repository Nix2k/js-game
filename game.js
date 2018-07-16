'use strict';

class Vector {
	constructor(x=0, y=0) {
		this.x = x;
		this.y = y;
	}

	plus(vector) {
	if (!(vector instanceof Vector)) {
		throw new Error('Vector.plus: Можно прибавлять к вектору только вектор типа Vector');
	}

    let newX = this.x + vector.x;
    let newY = this.y + vector.y;
    return new Vector(newX, newY);
	}
    
  times(mult) {
    let newX = mult*this.x;
    let newY = mult*this.y;
    return new Vector(newX, newY);
  }
    
}

class Actor {
  constructor(pos = new Vector(0, 0), size = new Vector(1, 1), speed = new Vector(0, 0)) {
    if (!((pos instanceof Vector)&&(size instanceof Vector)&&(speed instanceof Vector))) {
  		throw new Error('Actor.constructor: Все аргументы должны быть типа Vector');
  	}
    this.pos = pos;
    this.size = size;
    this.speed = speed;
  }
  
  act(){
    //ничего не делает
  }
  
  get left() {
    return this.pos.x;
  }
  
  get bottom() {
    return this.pos.plus(this.size).y;
  }
  
  get top() {
    return this.pos.y;
  }
  
  get right() {
    return this.pos.plus(this.size).x;
  }
  
  get type() {
    return 'actor';
  }
  
  isIntersect(actor = null) {
  	if (!(actor instanceof Actor)) {
  		throw new Error('Actor.isIntersect: Аргументом должен быть объект типа Actor');
  	}
    if (this === actor) {
      return false;
    }
    if (((((this.left>=actor.left)&&(this.left<actor.right))||((this.right>actor.left)&&(this.right<=actor.right)))&&
      (((this.top<actor.bottom)&&(this.top>=actor.top))||((this.bottom<=actor.bottom)&&(this.bottom>actor.top))))||
      ((((actor.left>this.left)&&(actor.left<this.right))||((actor.right>this.left)&&(actor.right<this.right)))&&
      (((actor.top<this.bottom)&&(actor.top>this.top))||((actor.bottom<this.bottom)&&(actor.bottom>this.top))))) {
      return true;
    }
    return false;
  }  
}

class Level {
  constructor (grid=[[]], actors=[]) {
    this.grid = grid;
    this.actors = actors;
    this.player = actors.find((element)=>{
    	return element.type==='player';
    });
    if ((grid.length == 1)&&(grid[0].length == 0)) {
    	this.height = 0;
    }
    else {
    	this.height = grid.length;
    }
    let maxWidth = 0;
    for (let row of this.grid) {
	    if (row != undefined) {
	    	if (row.length > maxWidth) {
	    		maxWidth = row.length;
	    	}
	    }
    }
    this.width = maxWidth; 
    this.status = null;
    this.finishDelay = 1;
  }
  
  isFinished() {
    return ((this.status != null)&&(this.finishDelay < 0));
  }
  
  actorAt(actor = null) {
    if (!(actor instanceof Actor)) {
  		throw new Error('Level.actorAt: Аргументом должен быть объект типа Actor');
  	}
    return this.actors.find((otherActor)=>{
    	return actor.isIntersect(otherActor);
    });
  }
  
  obstacleAt(position, size) {
    if ((!(position instanceof Vector))||(!(size instanceof Vector))) {
			throw new Error('Level.obstacleAt: Аргументы должны быть объектами типа Vector');
		}
    let actor = new Actor(position, size);
    if (actor.top >= this.height) {
      return 'lava';
    }
    if ((actor.left < 0)||(actor.right > this.width)||(actor.bottom <= 0)) {
      return 'wall';
    }
    for (let y = Math.floor(actor.top); y < Math.ceil(actor.bottom); y++) {
      for (let x = Math.floor(actor.left); x <  Math.ceil(actor.right); x++) {
        if (y < 0) {
          return 'wall';
        }
        if (y >= this.grid.length) {
          return 'lava';
        }
        if (this.grid[y][x]!=undefined) {
          return this.grid[y][x];
        }
      }
    }
    return undefined;
  }
  
  removeActor(actor) {
    let indexToDelete = this.actors.findIndex((element)=>{return(actor==element);});
    if (indexToDelete >= 0) {
      this.actors.splice(indexToDelete, 1);
    }
  }
  
  noMoreActors(type) {
    let indexOfActor = this.actors.findIndex((element)=>{return(element.type===type);});
    if (indexOfActor < 0) {
      return true;
    }
    return false;
  }
  
  playerTouched(type, actor = null) {
    if (this.status == null) {
      if ((type === 'lava')||(type === 'fireball')) {
        this.status = 'lost';
        return 'lost';
      }
      if (type === 'coin') {
        this.removeActor(actor);
        if (this.noMoreActors('coin')) {
          this.status = 'won';
          return 'won';
        }
      }
    }
  }
}

class LevelParser {
	constructor(reference) {
		this.reference = reference;
	}
	
	actorFromSymbol(char = null) {
		if ((char == null)||(this.reference == undefined)) {
			return undefined;
		}
		return this.reference[char];
	}

	obstacleFromSymbol(char = null) {
		switch (char) {
			case 'x': return 'wall';
			case '!': return 'lava';
		}
		return undefined;
	}

	createGrid(textLevel) {
		let grid = [];
		for (let i = 0; i < textLevel.length; i++) {
			grid.push([]);
			for (let char of textLevel[i]) {
				grid[i].push(this.obstacleFromSymbol(char));
			}
		}
		return grid;
	}

	createActors(textLevel) {
		let result = [];
		if (this.reference != undefined) {
			for (let i = 0; i < textLevel.length; i++) {
				for (let j =0; j< textLevel[i].length; j++) {
					let char = textLevel[i][j];
					let constr = this.actorFromSymbol(char);
          if (typeof(constr) == 'function') {
            let actor = new constr(new Vector(j, i));
            if (actor instanceof Actor) {
              result.push(actor);
            }
          }
				}
			}
		}
		return result;
	}

  parse(textLevel) {
    let level =new Level(this.createGrid(textLevel), this.createActors(textLevel));
    return level;
  }
}

class Fireball extends Actor {
  constructor (pos = new Vector(0, 0), speed = new Vector(0, 0)) {
    super(pos, new Vector(1, 1), speed);
  }

  get type() {
    return 'fireball';
  }

  getNextPosition(time = 1) {
    return this.pos.plus(this.speed.times(time));
  }

  handleObstacle() {
    this.speed = this.speed.times(-1);
  }

  act(time, level) {
    let nextPosition = this.getNextPosition(time);
    if (level.obstacleAt(nextPosition, this.size) != undefined) {
      this.handleObstacle();
    }
    else {
      this.pos = nextPosition;
    }
  }
}

class HorizontalFireball extends Fireball {
  constructor(pos = new Vector(0, 0)) {
    super(pos, new Vector(2, 0));
  }
}

class VerticalFireball extends Fireball {
  constructor(pos = new Vector(0, 0)) {
    super(pos, new Vector(0, 2));
  }
}

class FireRain extends Fireball {
  constructor(pos = new Vector(0, 0)) {
    super(pos, new Vector(0, 3));
    this.startPos = pos;
  }

  handleObstacle() {
    this.pos = this.startPos;
  }
}

class Coin extends Actor {
  constructor(pos = new Vector(0, 0)) {
    super(pos.plus(new Vector(0.2, 0.1)), new Vector(0.6, 0.6));
    this.startPos = this.pos;
    this.springSpeed = 8;
    this.springDist = 0.07;
    this.spring = 2 * Math.PI * Math.random();
  }

  get type() {
    return 'coin';
  }

  updateSpring(time = 1) {
    this.spring = this.spring + time * this.springSpeed;
  }

  getSpringVector() {
    return new Vector(0, this.springDist * Math.sin(this.spring));
  }

  getNextPosition(time = 1) {
    this.updateSpring(time);
    return this.startPos.plus(this.getSpringVector());
  }

  act(time) {
    this.pos = this.getNextPosition(time);
  }
}

class Player extends Actor {
  constructor(pos = new Vector(0, 0)) {
    super(pos.plus(new Vector(0, -0.5)), new Vector(0.8, 1.5), new Vector(0, 0));
  }

  get type() {
    return 'player';
  }
}

let levelLoader = loadLevels();
levelLoader.then((result)=>{
  let levels = JSON.parse(result);
  const actorDict = {
    '@': Player,
    'v': FireRain,
    'o': Coin,
    '=': HorizontalFireball,
    '|': VerticalFireball
  }
  const parser = new LevelParser(actorDict);
  runGame(levels, parser, DOMDisplay)
    .then(() => alert('Вы победили!!!'));
});