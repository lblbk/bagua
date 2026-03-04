/**
 * 解析本地 Markdown 内容为结构化数据
 * @param {string} mdContent - 整个 .md 文件的内容
 * @returns {Array} - 卦象详细数据数组
 */
export const parseHexagramMarkdown = (mdContent) => {
  // 按 --- 分割每一卦
  const hexagramBlocks = mdContent.split('---').filter(block => block.trim() !== '');

  return hexagramBlocks.map(block => {
    const lines = block.split('\n').filter(line => line.trim() !== '');
    const data = {
      title: '',      // e.g., 卦六十三 既济
      image: '',      // ☵☲
      guaCi: '',      // 卦辞
      xiangYue: '',   // 象曰
      yaoCi: []       // 爻辞数组
    };

    let currentSection = '';

    lines.forEach(line => {
      // 匹配标题
      if (line.startsWith('# ')) {
        data.title = line.replace('# ', '').trim();
      } 
      // 匹配部分标题
      else if (line.includes('**卦象**')) currentSection = 'image';
      else if (line.includes('**卦辞**')) currentSection = 'guaCi';
      else if (line.includes('**象曰**')) currentSection = 'xiangYue';
      else if (line.includes('**爻辞**')) currentSection = 'yaoCi';
      // 填充内容
      else {
        if (currentSection === 'image') data.image = line.trim();
        else if (currentSection === 'guaCi') data.guaCi += line.trim() + ' ';
        else if (currentSection === 'xiangYue') data.xiangYue += line.trim() + ' ';
        else if (currentSection === 'yaoCi' && line.startsWith('- ')) {
          data.yaoCi.push(line.replace('- ', '').trim());
        }
      }
    });

    return data;
  });
};