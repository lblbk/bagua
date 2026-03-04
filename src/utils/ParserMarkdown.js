/**
 * 解析本地 Markdown 内容为结构化数据
 * @param {string} mdContent - 整个 .md 文件的内容
 * @returns {Array} - 卦象详细数据数组
 */
export const parseHexagramMarkdown = (mdContent) => {
  const hexagramBlocks = mdContent.split('---').filter(block => block.trim() !== '');

  return hexagramBlocks.map(block => {
    const lines = block.split('\n').filter(line => line.trim() !== '');
    const data = { title: '', image: '', guaCi: '', xiangYue: '', yaoCi: [] };
    let currentSection = '';

    lines.forEach(line => {
      if (line.startsWith('# ')) data.title = line.replace('# ', '').trim();
      else if (line.includes('**卦象**')) currentSection = 'image';
      else if (line.includes('**卦辞**')) currentSection = 'guaCi';
      else if (line.includes('**象曰**')) currentSection = 'xiangYue';
      else if (line.includes('**爻辞**')) currentSection = 'yaoCi';
      else {
        if (currentSection === 'image') data.image = line.trim();
        else if (currentSection === 'guaCi') data.guaCi = (data.guaCi + ' ' + line.trim()).trim();
        else if (currentSection === 'xiangYue') data.xiangYue = (data.xiangYue + ' ' + line.trim()).trim();
        else if (currentSection === 'yaoCi' && line.startsWith('- ')) {
          const text = line.replace('- ', '').trim();
          const [label, content] = text.split(/：|:/);
          data.yaoCi.push({ label: label?.trim(), content: content?.trim() || '' });
        }
      }
    });
    return data;
  });
};