export default class CoordinateParser {

    static parse(input) {
        if (input==null) {
            input = '0';
        } else if (_.isNumber(input)) {
            input = ''+input;
        }
        input = input.replace(/\s/g, '').replace(/,/g, '.').toLowerCase();
        const unitFactor = { 
            "h": 360/24, 
            "m": 360/(24*60), 
            "s": 360/(24*60*60),
            "°": 1, 
            "'": 1/60, 
            "''": 1/(60*60) 
        };
        const directionFactor = { 
            "n": 1, 
            "s": -1, 
            "w": 1, 
            "o": -1, 
            "e": -1, 
        };
        const sign = input.charAt(0)=='-' ? -1 : +1;
        const regex = /([+]?\d+\.?\d*)(h|m|s|°|''|')?([noesw])?/g;
        let matches;
        let result = 0;
        while ((matches = regex.exec(input)) !==null) {
            const [full, decimal, unit, direction] = matches;
            const v = parseFloat(decimal);
            const summand = v * (unitFactor[unit] || 1) * (directionFactor[direction] || 1);
            result += summand; 
            console.log(v,unitFactor[unit],summand,result);
        }
        console.log(input,sign*result);
        return sign * result;
    }

    static format(value,unit) {
        const factor = unit==='h' ? 24/360 : 1;
        return (value * factor).toFixed(4)+unit;
    }

}