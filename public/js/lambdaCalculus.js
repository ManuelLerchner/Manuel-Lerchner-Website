code = `
def evaluate(inputString: str):
    L = Lexer()
    L.analyze(inputString)

    P = Parser(L)
    AST = P.parse()

    I = Interpreter()
    reducedAST = I.reduce(AST)

    return reducedAST

>>> myString = ((λx.λy.x A) B)
>>> evaluate(myString) 
>>> "A"
`;

function codeToString(str) {
    return str.substring(1);
}

document.getElementById("code-python1").innerHTML = codeToString(code);
