const getPixels = require('get-pixels');

module.exports = class Palette {
  static load(image) {
    return new Promise((resolve, reject) => {
      getPixels(image, (err, pixels) => {
        if (err) {
          reject(err);
        } else {
          resolve(Palette._convertPixelsToRGB(pixels));
        }
      });
    });
  }

  static _convertPixelsToRGB(pixels) {
    const width = pixels.shape[0];
    const height = pixels.shape[1];
    const rgbArr = [];
    for (let y = 0; y < height; ++y) {
      for (let x = 0; x < width; ++x) {
        const index = (y * width + x) * 4;
        rgbArr.push({
          r: pixels.data[index],
          g: pixels.data[index + 1],
          b: pixels.data[index + 2]
        });
      }
    }
    return rgbArr;
  }

  // https://en.wikipedia.org/wiki/Median_cut
  static medianCut(rgbArr, maxDepth = 0, depth = 0) {
    if (depth === maxDepth) {
      return Palette._averageBucket(rgbArr);
    }
    Palette._sortByChannel(rgbArr, Palette._findGreatestRange(rgbArr));
    const mid = rgbArr.length / 2;
    return [
      ...Palette.medianCut(rgbArr.slice(0, mid), maxDepth, depth + 1),
      ...Palette.medianCut(rgbArr.slice(mid + 1), maxDepth, depth + 1)
    ];
  }

  static _findGreatestRange(rgbArr) {
    let rmin = Number.POSITIVE_INFINITY;
    let gmin = Number.POSITIVE_INFINITY;
    let bmin = Number.POSITIVE_INFINITY;
    let rmax = Number.NEGATIVE_INFINITY;
    let gmax = Number.NEGATIVE_INFINITY;
    let bmax = Number.NEGATIVE_INFINITY;
    rgbArr.forEach((pixel) => {
      rmin = Math.min(rmin, pixel.r);
      gmin = Math.min(gmin, pixel.g);
      bmin = Math.min(bmin, pixel.b);
      rmax = Math.max(rmax, pixel.r);
      gmax = Math.max(gmax, pixel.g);
      bmax = Math.max(bmax, pixel.b);
    });
    const rrange = rmax - rmin;
    const grange = gmax - gmin;
    const brange = bmax - bmin;

    const max = Math.max(rrange, grange, brange);
    if (max === rrange) {
      return 'r';
    } else if (max === grange) {
      return 'g';
    } else {
      return 'b';
    }
  }

  static _sortByChannel(rgbArr, channel) {
    rgbArr.sort((a, b) => a[channel] - b[channel]);
  }

  static _averageBucket(rgbArr) {
    const color = rgbArr.reduce((prev, curr) => {
      prev.r += curr.r;
      prev.g += curr.g;
      prev.b += curr.b;
      return prev;
    }, {r: 0, g: 0, b: 0});
    return [{
      r: Math.round(color.r / rgbArr.length),
      g: Math.round(color.g / rgbArr.length),
      b: Math.round(color.b / rgbArr.length)
    }];
  }

  static sortByLuminance(rgbArr) {
    return rgbArr.sort((a, b) => Palette._relativeLuminance(a) - Palette._relativeLuminance(b));
  }

  static _relativeLuminance(pixel) {
    // https://en.wikipedia.org/wiki/Relative_luminance
    return 0.2126 * pixel.r + 0.7152 * pixel.g + 0.0722 * pixel.b;
  }
}
