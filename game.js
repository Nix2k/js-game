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
					if (constructor instanceof Actor) {
						actor = new constr();
						result.push(actor);
					}
				}
			}
		}
		return result;
	}
}