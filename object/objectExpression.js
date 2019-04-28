"use strict"

function errorPlace(index) {
    let res = "\n";
    for (var i = 0; i < index; i++) {
        res += " ";
    }
    res += "^";
    return res;
}

MyException.prototype = Error.prototype;
function MyException(name, message) {
	this.name = name;
	this.message = message;
}

OddClosingBracketException.prototype = MyException.prototype;
function OddClosingBracketException(ind, expr) {
	MyException.call(
		this,
		"OddClosingBracketException",
		"Odd closing bracket at position: " + (ind + 1) + "\n" + expr + errorPlace(ind)
    );
}

MissingClosingBracketException.prototype = MyException.prototype;
function MissingClosingBracketException(ind, expr) {
	MyException.call(
		this,
		"MissingClosingBracketException",
		"Missing closing bracket before position: " + (ind + 1) + "\n" + expr +  errorPlace(ind)
	);
}

MissingOperationBracketsException.prototype = MyException.prototype;
function MissingOperationBracketsException(ind, expr, mode) {
	MyException.call(
		this,
		"MissingOperationBracketsException",
		function (expr, ind, mode) {
			if (!mode) {
				return ("Opening bracket missing before position: " + (ind + 1) + "\n" + expr +  errorPlace(ind));
			} else {
				return ("Closing bracket missing after position: " + (ind + 1) + "\n" + expr +  errorPlace(ind));
			}
		}
	);
}

MissingOperandException.prototype = MyException.prototype;
function MissingOperandException(ind, expr, op) {
	MyException.call(
		this,
		"MissingOperandException",
		"Missing operand for operation: " + op + " at position: " + (ind + 1) + "\n" + expr + errorPlace(ind)
	);
}

OddOperandException.prototype = MyException.prototype;
function OddOperandException(ind, expr, op) {
	MyException.call(
		this,
		"OddOperandException",
    	"Odd operand for operation: " + op + " at position: " + (ind + 1) + "\n" + expr + errorPlace(ind)
    );
}

UnknownIdentifierException.prototype = MyException.prototype;
function UnknownIdentifierException(ind, expr, id) {
	MyException.call(
		this,
		"UnknownIdentifierException",
		"Unknown identifier " + id + " at position: " + (ind + 1) + "\n" + expr + errorPlace(ind)
    );
}

UnknownSymbolException.prototype = MyException.prototype;
function UnknownSymbolException(ind, expr) {
	MyException.call(
		this,
		"UnknownSymbolException",
		"Unknown symbol '" + expr.charAt(ind) + "' at position: " + (ind + 1) + "\n" + expr + errorPlace(ind)
	);
}

MissingOperationException.prototype = MyException.prototype;
function MissingOperationException(ind, expr, pos) {
	MyException.call(
		this,
		"MissingOperationException",
        "Missing operation " + pos + "opening parenthesis at position " + (ind + 1) + "\n" + expr + errorPlace(ind, 1)
    );
}

OddPartException.prototype = MyException.prototype;
function OddPartException(ind, expr) {
	MyException.call(
		this,
		"OddPartException",
		"Os part after correct expression at position: " + (ind + 1)  + "\n" + expr + errorPlace(ind)
    );
}

EmptyInputException.prototype = MyException.prototype;
function EmptyInputException(expr) {
	MyException.call(
		this,
		"EmptyInputException",
		"Empty input: \"" + expr + "\"" 
	);
}

const VARIABLES = {
	"x": 0,
	"y": 1,
	"z": 2,
}

function Const(value) {
    this.value = value;
}
Const.prototype.toString = function() { return this.value.toString(); }
Const.prototype.evaluate = function() { return this.value; }
Const.prototype.diff = function() { return ZERO; }
Const.prototype.prefix = Const.prototype.toString;
Const.prototype.postfix = Const.prototype.toString;

const ZERO = new Const(0);
const ONE = new Const(1);
function isZero(a) {
    return ((a instanceof Const) && (a.value === 0));
}
function isOne(a) {
    return ((a instanceof Const) && (a.value === 1));
}
function isConst(a) {
	return (a instanceof Const);
}

function Variable(name) {
	this.name = name
	this.getNumber = function() {
		return VARIABLES[name];
	}
}
Variable.prototype.toString = function() { return this.name; }
Variable.prototype.evaluate = function() { return arguments[this.getNumber()]; }
Variable.prototype.diff = function(d) { return d === this.name ? ONE : ZERO; }
Variable.prototype.prefix = Variable.prototype.toString;
Variable.prototype.postfix = Variable.prototype.toString;

function isVariable(a) {
	return (a instanceof Variable);
}

function Operation(action, char, diffRule, ...operands) {
	this.action = action;
	this.char = char;
	this.operands = operands;
	this.diffRule = diffRule;
}

Operation.prototype.toString = function() {	
	return this.operands.join(" ") + " " + this.char; 
}
Operation.prototype.evaluate = function() {
	const args = [].slice.call(arguments);
	const result = [];
	this.operands.map(function(operand) { result.push(operand.evaluate(...args)) });
	return this.action(...result);
}
Operation.prototype.diff = function(d) {
	const args = this.operands.concat(this.operands.map(function (operand) { return operand.diff(d) }));
	return this.diffRule(d, ...args);
}
Operation.prototype.prefix = function() {
	return "(" + this.char + " " + this.operands.map(function(operand) { return operand.prefix() }).join(" ") + ")";
}
Operation.prototype.postfix = function() {
	return "(" +  this.operands.map(function(operand) { return operand.postfix() }).join(" ") + " " + this.char + ")";
}

Add.prototype = Operation.prototype;
function Add(...args) {
	Operation.call(
			this, 
			(a, b) => a + b, 
			"+", 	
			(d, a, b, da, db) => new Add(da, db),
			args[0], args[1]
	);
}

Subtract.prototype = Operation.prototype;
function Subtract(...args) {
	Operation.call(
			this, 
			(a, b) => a - b, 
			"-", 	
			(d, a, b, da, db) => new Subtract(da, db),
			args[0], args[1]
	);
}

Multiply.prototype = Operation.prototype;
function Multiply(...args) {
	Operation.call(
			this, 
			(a, b) => a * b, 
			"*", 	
			(d, a, b, da, db) => new Add(new Multiply(a, db), new Multiply(b, da)),
			args[0], args[1]
	);
}

Divide.prototype = Operation.prototype;
function Divide(...args) {
	Operation.call(
			this, 
			(a, b) => a / b, 
			"/", 	
			(d, a, b, da, db) => new Divide(new Subtract(new Multiply(da, b), new Multiply(db, a)), new Multiply(b, b)),
			args[0], args[1]
	);
}

Negate.prototype = Operation.prototype;
function Negate(...args) {
	Operation.call(
			this, 
			a => -a, 
			"negate", 	
			(d, a, da) => new Negate(da),
			args[0]
	);
}


Sumexp.prototype = Operation.prototype;
function Sumexp(...args) {
	Operation.call(
		this,
		function(...operands) {
			let res = 0;
			operands.map(function(operand) { res += Math.exp(operand); } )
			return res;
		},
		"sumexp",
		function(d, ...operands) {
			let res = new Const(0);
			let first = operands.slice(0, operands.length / 2);
			let second = operands.slice(operands.length / 2, operands.length);
			for (let i = 0; i < first.length; i++) {
				res = new Add(res, new Multiply(new Sumexp(first[i]), second[i]));
			}
			return res;
		},
		...args
	);
}

Softmax.prototype = Operation.prototype;
function Softmax(...args) {
	Operation.call(
		this,
		function(...operands) {
			let res = 0;
			operands.map(function(operand) { res += Math.exp(operand); })
			return Math.exp(operands[0]) / res;
		},
		"softmax",
		function(d, ...operands) {
			let first = operands.slice(0, operands.length / 2);
			return new Divide(new Sumexp(first[0]), new Sumexp(...first)).diff(d);
		},
		...args
	);
}

let stack = [];
let index = 0;
let exceptionInd = [];
let expression = "";

const OPER = {
    "+": Add,
    "-": Subtract,
    "*": Multiply,
    "/": Divide,
    "negate": Negate,
    "sumexp": Sumexp,
    "softmax": Softmax,
};

const AMT_ARGS = {
    "+": 2,
    "-": 2,
    "*": 2,
    "/": 2,
    "negate": 1,
    "sumexp": -1,
    "softmax": -1,
};	

const MODES = {
	"prefix": 0,
	"postfix": 1,
}

function stackTop() {
	return stack[stack.length - 1];
}

function isNotEnd() {
	return (index < expression.length);
}

function skipWhiteSpace() {
	while (isNotEnd() && /\s/.test(expression.charAt(index))) {
		index++;
	}
}

function checkEmpty() {
    skipWhiteSpace();
    if (index === expression.length) {
        throw new EmptyInputException(expression);
    }
}

function getNumber() {
	let res;
	let cur = "";
	if (expression.charAt(index) === "-") {
		cur += "-";
		index++;
	}
	while (isNotEnd() && /\d/.test(expression.charAt(index))) {
		cur += expression.charAt(index++);
	}
    if (cur !== "" && cur !== "-") {
        return parseInt(cur);
    }
    if (cur === "-") {
        index--;
    }
    return undefined;
}

function getToken() {
	if (!(/[A-Za-z]/.test(expression.charAt(index)))) {
        throw new Error("!");
    }
    let res = "";
    while (isNotEnd() && /\w/.test(expression.charAt(index))) {
        res += expression.charAt(index++);
    }
    return res;
}

function isPartOfExpr(token) {
	return (token instanceof Const || token instanceof Variable || token instanceof Operation);
}

function doOperation(mode) {
	let curInd = undefined;
    let curOperation = undefined;
    let args = [];
    if (MODES[mode]) {
        if (!(stackTop() in OPER)) {
        	throw new MissingOperationException(index, expression, mode);
        } else {
            curOperation = stack.pop();
            curInd = exceptionInd.pop();
        }
        let cur
        while(stackTop() !== "(") {
            cur = stack.pop();
            exceptionInd.pop();
            if (!isPartOfExpr(cur)) {
            	throw new MissingOperandException(curInd, expression, curOperation);
            }
            args.push(cur);
        }
        cur = stack.pop();
        if (cur !== "(") {
        	throw new OddOperandException(curInd, expression, curOperation);
        }
        exceptionInd.pop();
    } else {
        while ((stackTop() !== "(") && !(stackTop() in OPER)) {
        	args.push(stack.pop());
            exceptionInd.pop();
        }
        if (stackTop() === "(") {
        	throw new MissingOperationException(exceptionInd.pop(), expression, mode);
        }
        curOperation = stack.pop();
        curInd = exceptionInd.pop();
        if (stack.pop() !== "(") {
        	throw new MissingOperationBracketsException(exceptionInd.pop(), expression, mode);
        }
        exceptionInd.pop()
    }
    let n = AMT_ARGS[curOperation];
    if (n > 0 && args.length > n) {
    	throw new OddOperandException(curInd, expression, curOperation);
    } else if (n > 0 && args.length < n) {
    	throw new MissingOperandException(curInd, expression, curOperation);
    } else {
        stack.push(new OPER[curOperation](...args.reverse()));
    }
}

function parse(s, mode) {
	let balance = 0;
	stack = [];
	index = 0;
	exceptionInd = [];
	expression = s;
	
	checkEmpty();	
	while (true) {
		skipWhiteSpace();
        if (!isNotEnd()) {
            break;
        }
        if (expression.charAt(index) === ")") {
            balance--;
            if (balance < 0) {
                throw new OddClosingBracketException(index, expression);
            }
            doOperation(mode);
            index++;
            if (balance == 0) {
                break;
            }
            continue;
        }
        exceptionInd.push(index);
        if (expression.charAt(index) === "(") {
            stack.push("(");
            index++;
            balance++;
            continue;
        }
        let curNumber = getNumber();
        if (curNumber !== undefined) {
            stack.push(new Const(curNumber));
            continue;
        }
        let curOp = undefined;
        let curToken;
        if (expression.charAt(index) in OPER) {
            curOp = expression.charAt(index);
            index++;
        } else {
            curToken = getToken();
            if (curToken in OPER) {
                curOp = curToken;
            }
        }
        if (curOp !== undefined) {
            stack.push(curOp);
        } else if (curToken in VARIABLES) {
            stack.push(new Variable(curToken));
        } else {
            throw new UnknownIdentifierException(exceptionInd.pop(), expression, curToken);
        }
    }
	skipWhiteSpace();
    if (index !== expression.length) {
    	throw new OddPartException(index, expression);
    } else if (balance > 0) {
    	throw new MissingClosingBracketException(index, expression);
    } else if (stack.length > 1) {
    	throw new MissingOperationBracketsException(expression, exceptionInd[0], mode);
    }
    let res = stack.pop();
    if (!isPartOfExpr(res)) {
    	throw new MissingOperationBracketsException(expression, exceptionInd.pop(), mode);
    }
    return res;
}

function parsePrefix(s) {
	return parse(s, "prefix");
}

function parsePostfix(s) {
	return parse(s, "postfix");
}
