/**
 * 
 */

// ベルヌーイ数 B0〜B20 （B_odd は 1 を除き 0）
const bernoulli = [
	1, 1 / 2, 1 / 6, 0,
	-1 / 30, 0, 1 / 42, 0,
	-1 / 30, 0, 5 / 66, 0,
	-691 / 2730, 0, 7 / 6, 0,
	-3617 / 510, 0, 43867 / 798, 0,
	-174611 / 330
];

////////////////////////////////////////////////////////////////////////////////////////////////

// 二項係数
function comb(n, k) {
	let r = 1;
	for (let i = 1; i <= k; i++) {
		r = r * (n - k + i) / i;
	}
	return r;
}

// 最大公約数 (GCD) を求める関数 (負の数になることもあり)
function gcd(x, y) {
	return y === 0 ? x : gcd(y, x % y);
}

// ミラー・ラビン法　javascriptのNumber型が扱える2^53-1=9007199254740991まで確実に素数を判定
// 理論的には2^64-1まで確実に判定できるが、BigInt型への変換が必要
function isPrimeDeterministic(n) {
	if (n === 2 || n === 3) return true;
	if (n < 2 || n % 2 === 0 || n % 3 === 0) return false;

	// n - 1 = d * 2^r を求める
	let r = 0;
	let d = n - 1;
	while (d % 2 === 0) {
		d /= 2;
		r++;
	}

	// 証人のリスト（確定的に正しい）
	const witnesses = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37];

	for (let a of witnesses) {
		if (a >= n) break;

		let x = modPow(a, d, n);
		if (x === 1 || x === n - 1) continue;

		let found = false;
		for (let i = 0; i < r - 1; i++) {
			x = modPow(x, 2, n);
			if (x === n - 1) {
				found = true;
				break;
			}
		}
		if (!found) return false;
	}
	return true;
}

// 高速な (base^exp) % mod を求める
function modPow(base, exp, mod) {
	let result = 1;
	base = base % mod;

	while (exp > 0) {
		if (exp % 2 === 1) {
			result = (result * base) % mod;
		}
		exp = Math.floor(exp / 2);
		base = (base * base) % mod;
	}
	return result;
}

// num の mod による絶対値最小剰余（絶対値が mod / 2 以下）を返す
function minMod(num, mod) {
	if (mod === 0) return NaN; // ゼロ除算を回避
	mod = Math.abs(mod); // mod を絶対値に修正
	let result = num % mod;
	if (result > mod / 2) return result - mod;
	if (result < - mod / 2) return result + mod;
	return result;
}

////////////////////////////////////////////////////////////////////////////////////////////////

// S_m(d) % |d| を計算する
function calcOwn(m, d) {
	if (m >= 3 && m % 2 === 1 && d % 4 === 0) return 0; // 例外処理

	d == Math.abs(d);

	let sgn = 1;

	if (m % 2 === 0) sgn = -1;

	let group = [];

	// d と m の大小でどちらからテストするか判断
	if (d < m) {
		for (let i = 2; i * i <= d; i++) {
			if (d % i == 0) { // d の約数 i について
				if (m % (i - 1) == 0) group.push(i); // i - 1 が m の約数なら追加

				let D = d / i; // もう一つの d の約数 d / i について
				if (m % (D - 1) == 0 && i != D) group.push(D);
			}
		}
		if (m % (d - 1) == 0) group.push(d);
	} else {
		for (let i = 2; (i - 1) * (i - 1) <= m; i++) {
			if (m % (i - 1) == 0) {
				if (d % i == 0) group.push(i);

				let M = (m / (i - 1)) + 1;
				if (d % M == 0 && i != M) group.push(M);
			}
		}
	}
	group = group.filter(num => isPrimeDeterministic(num));

	let ans = d;
	for (let item of group) { // 残った素数で -n/p の総和を計算
		ans -= d / item;
	}

	ans == sgn * ans;
	return ans;
}

/* * sumKthPower(n, m): 1^m + … + n^m を返す
 * m は整数（ここでは 0〜20 を想定）
 */
function sumKthPower(m, d, n) {
	let sum = 0;
	for (let j = 0; j <= m; j++) {
		const B = bernoulli[j];
		sum += comb(m + 1, j) * B * n ** (m + 1 - j);
	}
	return (Math.round(sum / (m + 1))) % d;
}

// S_m(n) mod d を計算, rが大きい場合主にここで容量を食う
function Smod(m, d, n) {
	let sgn = 1;
	if (n < 0) {
		n = -n - 1
		if (m % 2 === 0) sgn = -1;
	}
	let result = 0;
	for (let i = 1; i <= n; i++) { // r の大きさだけ繰り返しが増える
		result += modPow(i, m, d);
	}
	return (sgn * result) % d;
}

////////////////////////////////////////////////////////////////////////////////////////////////

function clickButton() {

	const m = Number(document.getElementById("index_m").value); // m 取得

	const a = Number(document.getElementById("index_a").value); // a 取得

	const b = Number(document.getElementById("index_b").value); // b 取得

	const c = Number(document.getElementById("index_c").value); // c 取得

	if (m < 1) return alert("m は 1 以上の整数を指定してください。");

	if (b === 0) return alert("0で割ることはできません。"); // b = 0 の時処理を終了

	let g = gcd(a, b); // 最大公約数の計算

	let divisor = a - b * c; // 割る数 a-bc の計算

	document.getElementById("divisor").value = a - b * c;

	if (divisor === 0) return alert("ゼロ除算です！");

	divisor = Math.abs(divisor / g);

	let SCmod = 0;

	if (m <= 20) { // 20乗以下の時は公式を参照にして計算する
		SCmod = sumKthPower(m, divisor, c);
	} else { // 実際に塁上の剰余を計算しながら答えを出す
		SCmod = Smod(m, divisor, c);
	}

	let ans = b * SCmod + g * calcOwn(m, divisor);

	ans = minMod(ans, divisor * g); // 最小剰余を計算

	document.getElementById("remainder").value = ans;

}