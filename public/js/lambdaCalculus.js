var targetCode = `
def evaluate(inputString: str):
    L = Lexer()
    L.analyze(inputString)

    P = Parser(L)
    AST = P.parse()

    I = Interpreter()
    reducedAST = I.reduce(AST)

    return reducedAST

>>> myString = "((λx.λy.x A) B)"
>>> evaluate(myString) 
>>> "A"
`;

var tokenCode = `
class Token:
    LAMBDA = "LAMBDA"
    DOT = "DOT"
    VAR = "VAR"
    LPAR = "LPAR"
    RPAR = "RPAR"
    SPACE = "SPACE"

    def __init__(self, type: str, varName: str = None):
        self.type = type
        self.varName = varName
        self.internalIDX = 0

    def __repr__(self):
        return str(self.type) + 
            (":"+str(self.varName) 
            if self.varName is not None else "")

`;

var lexerCode = `
class Lexer:
    def __init__(self):
        self.tokens = []
        self.idx = 0
        self.str = None

    def analyze(self, inputString: str):
        """Splits Input String into Tokens, puts them to the Tokens-Array"""
        for chr in inputString:
            if chr == " ":
                self.tokens.append(Token(Token.SPACE))
            elif chr == "λ":
                self.tokens.append(Token(Token.LAMBDA))
            elif chr == ".":
                self.tokens.append(Token(Token.DOT))
            elif chr == "(":
                self.tokens.append(Token(Token.LPAR))
            elif chr == ")":
                self.tokens.append(Token(Token.RPAR))
            elif chr.isalpha() or chr.isnumeric():
                self.tokens.append(Token(Token.VAR, str(chr)))

    def checkNext(self, reqType):
        """Checks if next Token matches the required type."""
        if self.tokens[self.idx].type != reqType:
            raise ValueError('Token doesnt match!')

    def skipToken(self, reqType):
        """Skips a Token of given type"""
        self.checkNext(reqType)
        self.idx += 1

    def nextToken(self, reqType):
        """Returns next Token if it is of given type"""
        self.checkNext(reqType)
        tok = self.tokens[self.idx]
        self.idx += 1
        return tok

    def peekToken(self, reqType):
        """peeks next Token, checks if it is of given type"""
        return self.tokens[self.idx].type == reqType
`;

var lexerTest = `
>>> inputString="((λx.λy.x A) B)"
>>> L = Lexer()
>>> L.analyze(inputString)
>>> [LPAR, LPAR, LAMBDA, VAR:x, DOT,
     LAMBDA, VAR:y, DOT, VAR:x, SPACE,
     VAR:A, RPAR, SPACE, VAR:B, RPAR]
`;

var grammar = `
"""
<λexp>: :=  |<var>                                  #Variable
            |<LAMBDA> <var> <DOT> <λexp>            #Function
            |<LPAR> <λexp> <SPACE> <λexp> <RPAR>    #Application
"""    
`;

var grammarExpl = `
"a"                         #Variable 'a'
"(f x)"                     #Appliction 'f(x)'
"λx.x"                      #Identity-Function
"λf.(f f)"                  #Self-Application-Function
"λf.λa.λb.((f b) a)"        #Function that switches its arguments around
`;

var parserCode = `
class Parser:
    def __init__(self, Lexer: Lexer):
        self.Lexer = Lexer

    def parse(self):
        """Parses given Lexer-Tokens into AST"""
        N = self.expression()
        return N

    def expression(self):
        """Creates Expression"""

        if self.Lexer.peekToken(Token.VAR):
            return self.variable()

        elif self.Lexer.peekToken(Token.LAMBDA):
            return self.function()

        elif self.Lexer.peekToken(Token.LPAR):
            return self.application()

    def variable(self):
        """Creates VarNode"""

        tok = self.Lexer.nextToken(Token.VAR)

        return VarNode(tok)

    def function(self):
        """Creates FunctionNode"""

        self.Lexer.skipToken(Token.LAMBDA)
        var = self.variable()
        self.Lexer.skipToken(Token.DOT)
        exp = self.expression()

        return FunctionNode(var, exp)

    def application(self):
        """Creates ApplicationNode"""

        self.Lexer.skipToken(Token.LPAR)
        A = self.expression()
        self.Lexer.skipToken(Token.SPACE)
        B = self.expression()
        self.Lexer.skipToken(Token.RPAR)
        return ApplicationNode(A, B)
`;

var nodeCode = `
class FunctionNode:

    def __init__(self, variable, exp):
        self.variable = variable
        self.exp = exp

    def __repr__(self):
        return "λ"+str(self.variable)+"."+str(self.exp)

    def replace(self, varNode, new, newIdx):
        if self.exp.replace(varNode, new, newIdx):
            self.exp = new

    def renameVariables(self, idx):
        self.exp.renameVariables(2*idx+2)
        newVar = VarNode(
            Token(Token.VAR, self.variable.token.varName, 2*idx+2))
        self.replace(VarNode(self.variable.token), newVar, 2*idx+2)
        self.variable = newVar


class ApplicationNode:

    def __init__(self, expA, expB):
        self.expA = expA
        self.expB = expB

    def __repr__(self):
        return "("+str(self.expA)+" "+str(self.expB)+")"

    def replace(self, varNode, new, newIdx):
        NEW = deepcopy(new)
        NEW.renameVariables(newIdx)
        
        if self.expA.replace(varNode, NEW, 2*newIdx+1):
            self.expA = NEW
        if self.expB.replace(varNode, NEW, 2*newIdx+2):
            self.expB = NEW

    def renameVariables(self, idx: FunctionNode):
        self.expA.renameVariables(2*idx+1)
        self.expB.renameVariables(2*idx+2)


class VarNode:

    def __init__(self, token: Token):
        self.token = token

    def __repr__(self):
        return str(self.token)

    def replace(self, varNode, new, newIdx):
        return (varNode.token.varName == self.token.varName) and (
            varNode.token.internalIDX == self.token.internalIDX)

    def renameVariables(self, idx: FunctionNode):
        pass

`;

var parserExpl = `
>>> myString = "((λx.λy.x A) B)"

>>> L = Lexer()
>>> L.analyze(myString)
>>> [LPAR, LPAR, LAMBDA, VAR:x, DOT,
     LAMBDA, VAR:y, DOT, VAR:x, SPACE,
     VAR:A, RPAR, SPACE, VAR:B, RPAR]

>>> P = Parser(L)
>>> AST = P.parse()
`;

var interprCode = `
class Interpreter:

    def __init__(self, MAX_STEPS=10):
        self.MAX_STEPS = MAX_STEPS

    def reduce(self, AST):
        """Reduces the given node as far as possible"""

        reduced = self.evaluate(AST)

        return reduced

    def isFunction(self, N): return type(N) == FunctionNode
    def isVariable(self, N): return type(N) == VarNode
    def isApplication(self, N): return type(N) == ApplicationNode

    def evaluate(self, Node):
        for _ in range(self.MAX_STEPS):
            if self.isApplication(Node):

                if self.isVariable(Node.expA):
                    Node.expB = self.evaluate(Node.expB)
                    return Node

                elif self.isFunction(Node.expA):
                    newIdx = Node.expA.variable.token.internalIDX
                    Node.expA.replace(Node.expA.variable, Node.expB,newIdx)
                    Node = Node.expA.exp

                elif self.isApplication(Node.expA) and self.isVariable(Node.expB):
                    prev = Node.expA
                    Node.expA = self.evaluate(Node.expA)
                    if prev == Node.expA:
                        return Node
                else:
                    prev = Node.expA
                    Node.expA = self.evaluate(Node.expA)
                    if prev == Node.expA:
                        return Node

            elif self.isFunction(Node):
                Node.exp = self.evaluate(Node.exp)
                return Node
            else:
                return Node

        return Node
`;


var finalExpl = `
>>> myString = "((λx.λy.x A) B)"

>>> L = Lexer()
>>> L.analyze(myString)
>>> [LPAR, LPAR, LAMBDA, VAR:x, DOT,
     LAMBDA, VAR:y, DOT, VAR:x, SPACE,
     VAR:A, RPAR, SPACE, VAR:B, RPAR]

>>> P = Parser(L)
>>> AST = P.parse()

>>> I = Interpreter()
>>> I.reduce(AST)
>>> VAR:A   #Results in the variable "A"
`;

function codeToString(str) {
    return str.substring(1);
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

document.getElementById("code-python1").innerHTML = codeToString(targetCode);
document.getElementById("code-python2").innerHTML = codeToString(lexerCode);
document.getElementById("code-python3").innerHTML = codeToString(tokenCode);
document.getElementById("code-python4").innerHTML = codeToString(lexerTest);
document.getElementById("code-python5").innerHTML = codeToString(
    escapeHtml(grammar)
);
document.getElementById("code-python6").innerHTML = codeToString(grammarExpl);
document.getElementById("code-python7").innerHTML = codeToString(parserCode);
document.getElementById("code-python8").innerHTML = codeToString(nodeCode);
document.getElementById("code-python9").innerHTML = codeToString(parserExpl);
document.getElementById("code-python10").innerHTML = codeToString(interprCode);
document.getElementById("code-python11").innerHTML = codeToString(finalExpl);
