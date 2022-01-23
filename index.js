/*
* Fonctions utiles pour la génération
*/

const customRandom = function(s) {
    var mask = 0xffffffff;
    var m_w  = (123456789 + s) & mask;
    var m_z  = (987654321 - s) & mask;

    return function() {
      m_z = (36969 * (m_z & 65535) + (m_z >>> 16)) & mask;
      m_w = (18000 * (m_w & 65535) + (m_w >>> 16)) & mask;

      var result = ((m_z << 16) + (m_w & 65535)) >>> 0;
      result /= 4294967296;
      return result;
    }
}(Math.ceil(Date.now() / (24*3600*1000)))

function randomInteger(min, max) {
    return Math.floor(customRandom() * (max - min)) + min
}

function gcdExtended(a, b) {
    // Base Case 
    if (a == 0) { 
        return [b, 0, 1]
    }
    
    var [gcd, x1, y1] = gcdExtended(b % a, a)
     
    // Update x and y using results of recursive call 
    var x = y1 - ((b / a) >> 0) * x1
    var y = x1
     
    return [gcd, x, y]
}

function randomPrimeWith(n, bound) {
    var candidate = n
    var gcd = 0
    var u = 0
    var v = 0

    // On test jusqu'à avoir ce qu'on veut
    while (gcd != 1) {
        candidate = randomInteger(1, bound)
        var [cgcd, cu, cv] = gcdExtended(n, candidate)
        gcd = cgcd
        u = cu
        v = cv
    }

    return [candidate, u, v]
}

/*
* Génération de matrice
*/

// Matrice 3x3
function randomMatrix3(bound) {
    // Générons quelques coefficient randoms
    var a = randomInteger(1, bound)
    var b = randomInteger(-bound, bound)
    var d = randomInteger(-bound, bound)
    var f = randomInteger(-bound, bound)
    var h = randomInteger(-bound, bound)
    var i = randomInteger(-bound, bound)
    var [g, u, v] = randomPrimeWith(a, bound)

    // On calcul nos derniers coef
    var i = u
    var c = -v
    var e = (1 - d*h*c + f*h*a - g*b*f + i*b*d) / (a*i - g*c)

    // Notre magnifique matrice normalement dans GL_3(Z)
    return [
        [a, b, c],
        [d, e, f],
        [g, h, i]
    ]
}

// Matrice 3x3 avec coef du milieu bounded
function randomMatrix3Bounded(bound, factor) {
    var candidate = randomMatrix3(bound)
    while (Math.abs(candidate[1][1]) > factor*bound) {
        candidate = randomMatrix3(bound)
    }
    return candidate
}

/*
* Inversion de la matrice
*/

// Inversion avec pivot
function pivot(matrix) {
    // Génération de la matrice de travail
    var n = matrix.length
    var inverse = []
    for (var i = 0; i < n; i++) {
        var line = []
        for (var j = 0; j < n; j++) {
            line.push(i == j ? 1 : 0)
        }
        inverse.push(line)
    }

    // On effectue le pivot :
    // Les zeros en bas
    for (i = 0; i < n-1; i++) {
        for (j = i+1; j < n; j++) {
            var ai = matrix[i][i]
            var aj = matrix[j][i]
            var [gcd, _, _] = gcdExtended(Math.abs(ai), Math.abs(aj))
            for (k = 0; k < n; k++) {
                matrix[j][k] = matrix[i][k]*(aj/gcd) - matrix[j][k]*(ai/gcd)
                inverse[j][k] = inverse[i][k]*(aj/gcd) - inverse[j][k]*(ai/gcd)
            }
        }
    }

    // Les zeros en haut
    for (i = 0; i < n-1; i++) {
        for (j = i+1; j < n; j++) {
            var ai = matrix[n-i-1][n-i-1]
            var aj = matrix[n-j-1][n-i-1]
            var [gcd, _, _] = gcdExtended(Math.abs(ai), Math.abs(aj))
            for (k = 0; k < n; k++) {
                matrix[n-j-1][k] = matrix[n-i-1][k]*(aj/gcd) - matrix[n-j-1][k]*(ai/gcd)
                inverse[n-j-1][k] = inverse[n-i-1][k]*(aj/gcd) - inverse[n-j-1][k]*(ai/gcd)
            }
        }
    }

    // On divise pour avoir des 1
    // Si jamais on a un zero, la matrice n'est pas inversible
    for (i = 0; i < n; i++) {
        var ai = matrix[i][i]
        if (ai == 0) {
            return null
        }
        for (k = 0; k < n; k++) {
            matrix[i][k] = matrix[i][k] / ai
            inverse[i][k] = inverse[i][k] / ai
        }
    }
    
    // On revoit l'inverse de la matrice
    return inverse
}

/*
* MathJax rendering
*/

window.MathJax = {
    startup: {
        ready: () => {
            MathJax.startup.defaultReady();
            MathJax.startup.promise.then(() => {
                const bound = 10
                const factor = 2

                const matrix = randomMatrix3Bounded(bound, factor)
                const matrixhtml = document.getElementById('matrixdata')
                matrixhtml.innerHTML = '$$A = \\begin{bmatrix}' + matrix[0][0] + '&' + matrix[0][1] + '&' + matrix[0][2] + '\\\\' + matrix[1][0] + '&' + matrix[1][1] + '&' + matrix[1][2] + '\\\\' + matrix[2][0] + '&' + matrix[2][1] + '&' + matrix[2][2] + '\\end{bmatrix}$$';
                
                const inverse = pivot(matrix)
                const inversehtml = document.getElementById('inversedata')
                inversehtml.innerHTML = '$$A^{-1} = \\begin{bmatrix}' + inverse[0][0] + '&' + inverse[0][1] + '&' + inverse[0][2] + '\\\\' + inverse[1][0] + '&' + inverse[1][1] + '&' + inverse[1][2] + '\\\\' + inverse[2][0] + '&' + inverse[2][1] + '&' + inverse[2][2] + '\\end{bmatrix}$$';
                
                MathJax.typeset();
            });
        }
    }
};

function showInverse() {
    const inversehtml = document.getElementById('inversedata')
    inversehtml.style = ""
    const inversebutton = document.getElementById('inversebutton')
    inversebutton.style = "display:none"
}
