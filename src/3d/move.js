import * as Bol3D from './Bol3d';
export default class Move {
    currentMove = null;
    moves = [];
    linePath = []
    paused = true
    constructor(car, path, speed = 5,direction = false) {
        this.linePath = path;
        this.car = car;
        this.speed = speed;
        this.direction = direction;
        let moves = [];
        this.position = {
            x: car.position.x,
            y: car.position.y,
            z: car.position.z
        };
        for (let index = 0; index < this.linePath.length; index++) {
            moves.push(new Bol3D.TWEEN.Tween(car).to({
                position: {
                    x: this.linePath[index][0],
                    y: this.linePath[index][1],
                    z: this.linePath[index][2]
                },
            }, this.pointLength(index == 0 ? [this.position.x,this.position.y,this.position.z] : this.linePath[index - 1], this.linePath[index])).onComplete(() => {
                if(direction) {
                    if(index > 0) {
                        car.lookAt(new Bol3D.Vector3(...this.linePath[index - 1]))
                    }else {
                        car.lookAt(new Bol3D.Vector3(this.position.x,this.position.y,this.position.z))
                    }
                    if(car.name != '400') {
                        if(car.name == 'wsc') {
                            car.rotateOnAxis(new Bol3D.Vector3(0, 1, 0), Math.PI / -2)
                        }else if(car.name == '757') {
                            car.rotateOnAxis(new Bol3D.Vector3(0, 1, 0), Math.PI)
                        }else car.rotateOnAxis(new Bol3D.Vector3(0, 1, 0), Math.PI / 2)
                    }
                }else {
                    if (index < this.linePath.length - 1) {
                        car.lookAt(new Bol3D.Vector3(...this.linePath[index + 1]))
                        if(car.name != '400') {
                            if(car.name == '757' || car.name == 'wsc') {
                                car.rotateOnAxis(new Bol3D.Vector3(0, 1, 0), Math.PI)
                            }else car.rotateOnAxis(new Bol3D.Vector3(0, 1, 0), Math.PI / 2)
                        }
                    }
                }
            }))
        }
        this.initMove(moves)
    }
    initMove(moves) {
        moves.forEach((item, index) => {
            if (index > 0) {
                moves[index - 1].chain(item);
            } else if (this.moves.length > 0) {
                this.moves[this.moves.length - 1].chain(item)
            }
            item.onStart(() => {
                this.currentMove = item;
            })
        });
        this.moves = this.moves.concat(moves)
    }
    addMoves(fn) {
        if (typeof fn == 'function') {
            this.initMove(fn(this.car))
        } else this.initMove(fn)
        return this
    }
    start() {
        if (this.paused) {
            if (this.currentMove && this.currentMove.isPaused()) this.currentMove.resume()
            else {
                if (this.car) {
                    if(!this.direction) {
                        this.car.lookAt(new Bol3D.Vector3(...this.linePath[0]))
                        if(this.car.name == '757' || this.car.name == 'wsc') {
                            this.car.rotateOnAxis(new Bol3D.Vector3(0, 1, 0), Math.PI)
                        }else this.car.rotateOnAxis(new Bol3D.Vector3(0, 1, 0), Math.PI / 2)
                        
                    }
                }
                this.moves[0].start();
            }
            this.paused = false;
        } else this.pause()
        return this
    }
    stop(fn) {
        if (this.currentMove) this.currentMove.stop();
        this.currentMove = null;
        this.paused = true;
        if (fn) fn();
        return this
    }
    pause() {
        if (this.currentMove) this.currentMove.pause()
        this.paused = true;
        return this
    }
    resume() {
        if (this.currentMove) this.currentMove.resume();
        this.paused = false;
        return this
    }
    pointLength(piont1, point2) {
        return new Bol3D.Vector3(...piont1).distanceTo(new Bol3D.Vector3(...point2)) * this.speed
    }
    onComplete(fn) {
        this.moves[this.moves.length - 1].onComplete(() => {
            this.paused = true;
            this.currentMove = null;
            if (fn) fn()
        })
        return this
    }
}