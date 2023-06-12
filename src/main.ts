import * as sys from './sys.js';
import * as testEs from './testEs.js';

// Test all 'test' methods in TypeTest
let test = new testEs.TypeTest();
test.typeof$().methods().each((m) => {
  if (m.name$().startsWith("test"))
  {
    m.call(test);
    console.log("Successfully finished %s!", m.name$());
  }
})

// Create some random objects
let objA = new testEs.MxClsA();
console.log(objA.thisb().aa());
try {
  objA.thisa();
} catch (e) {
  console.log("caught!");
}

let str = "#colors #194a7b #aaaahhhhh";
let rgbMatcher = sys.Regex.fromStr("#([0-9a-fA-F]{3}){1,2}").matcher(str);
rgbMatcher.find();
console.log(rgbMatcher.group());
