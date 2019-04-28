"use strict"

const VARIABLES = {
	"x": 0,
	"y": 1,
	"z": 2,
}

const operation = op => (...args) => (x, y, z) => {
	let res = [];
	args.map(function(operand) {
		res.push(operand(x, y, z))
	});
    return op(res);
}

const cnst = value => () => { 
	return value;	
}

const CONSTANTS = {
	"pi": Math.PI,
	"e": Math.E,
	"one": 1,
	"two": 2,
}
 	
const one = cnst(1);
const two = cnst(2);
const pi = cnst(Math.PI);
const e = cnst(Math.E);

const variable = name => (...args) => {
	return args[VARIABLES[name]];
}

const add = operation(args => args[0] + args[1]);

const subtract = operation(args => args[0] - args[1]);

const multiply = operation(args => args[0] * args[1]);

const divide = operation(args =>  args[0] / args[1]);

const negate = operation(args => -args[0]);

const avg5 = operation(args => (args[0] + args[1] + args[2] + args[3] + args[4]) / 5);

const med3 = operation(args => {
	args.sort(function(a,b) {return a - b;})
	return args[1];
});

const abs = operation(args => Math.abs(args[0]));

const iff = operation(args => {
	return args[0] >= 0 ? args[1] : args[2];
});

const parse = s => {
    const tokens = s.split(" ").filter(function (token) {
        return token.length > 0;
    });
    let stack = [];
    const OPER = {
        "+": add,
        "-": subtract,
        "*": multiply,
        "/": divide,
        "negate": negate,
        "avg5": avg5,
        "med3": med3,
        "abs": abs,
        "iff": iff,
    };
    const AMT_ARGS = {
        "+": 2,
        "-": 2,
        "*": 2,
        "/": 2,
        "negate": 1,
        "med3": 3,
        "avg5": 5,
        "abs": 1,
        "iff": 3,
    };
    tokens.map(function(token) {
        if (token in CONSTANTS) {
            stack.push(cnst(CONSTANTS[token]));
        } else if (token in VARIABLES) {
            stack.push(variable(token));
        } else if (token in OPER) {
        	let args = stack.slice(stack.length - AMT_ARGS[token], stack.length);
        	stack = stack.slice(0, stack.length - AMT_ARGS[token]);
            stack.push(OPER[token](...args));
        } else {
        	stack.push(cnst(parseInt(token)));
        }
    });
    return stack.pop();
}
