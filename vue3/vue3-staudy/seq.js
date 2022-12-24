/**
 * 最常递增子序列
 * @param {Array} arr 
 * @returns 
 */
function getSequence(arr) {
    let len = arr.length;
    let result = [0];

    let resultLastIndex;
    let start;
    let end;
    let middle;
    let p = arr.slice(0);
    for (let i = 0; i < arr.length; i++) {
        const arrI = arr[i];
        if (arrI !== 0) {
            resultLastIndex = result[result.length - 1]
            if (arr[resultLastIndex] < arrI) {
                result.push(i)

                p[i] = resultLastIndex;//最后一项 记住前一项的索引
                continue;
            }

            start = 0;
            end = result.length - 1;
            while (start < end) {
                middle = (start + end) / 2 | 0//向下取整
                if (arr[result[middle]] < arrI) {
                    start = middle + 1;
                } else {
                    end = middle
                }
            }
            if (arrI < arr[result[start]]) {
                p[i] = result[start - 1];//最后一项 记住前一项的索引
                result[start] = i
            }
        }
    }
    let i = result.length;
    let last = result[i - 1];//最后一项索引

    while (i-- > 0) {
        result[i] = last;//最后一项的索引来追溯
        last = p[last];//用p中的索引 来引导追溯
    }

    return result

}
let result = getSequence([2, 5, 8, 4, 6, 7, 9, 3])
console.log(result)