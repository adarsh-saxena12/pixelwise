const formatText = (text: string) => {
    const lines = text.split("\n");
    const formattedElements: JSX.Element[] = [];
    let currentList: JSX.Element[] = [];
    let isOrderedList = false;
    let isUnorderedList = false;
  
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
  
      if (trimmedLine === "") {
        formattedElements.push(<br key={index} />); // Add spacing for empty lines
        return;
      }
  
      if (trimmedLine.startsWith("**")) {
        // Convert **Bold Headings** into <h3>
        formattedElements.push(
          <h3 key={index} className="text-lg font-semibold text-gray-800 mt-4">
            {trimmedLine.replace(/\*\*/g, "")}
          </h3>
        );
        return;
      }
  
      if (/^\d+\./.test(trimmedLine)) {
        // Handle numbered lists (ordered list <ol>)
        if (!isOrderedList) {
          isOrderedList = true;
          formattedElements.push(<ol key={`ol-${index}`} className="ml-5 list-decimal text-gray-600">{currentList}</ol>);
          currentList = [];
        }
        currentList.push(
          <li key={index} className="ml-5">{trimmedLine.replace(/^\d+\.\s*/, "")}</li>
        );
        return;
      }
  
      if (trimmedLine.startsWith("* ")) {
        // Handle bullet lists (unordered list <ul>)
        if (!isUnorderedList) {
          isUnorderedList = true;
          formattedElements.push(<ul key={`ul-${index}`} className="ml-5 list-disc text-gray-600">{currentList}</ul>);
          currentList = [];
        }
        currentList.push(
          <li key={index} className="ml-5">{trimmedLine.replace("* ", "")}</li>
        );
        return;
      }
  
      // Push pending lists to elements
      if (isOrderedList) {
        formattedElements.push(<ol key={`ol-end-${index}`} className="ml-5 list-decimal text-gray-600">{currentList}</ol>);
        isOrderedList = false;
        currentList = [];
      }
      if (isUnorderedList) {
        formattedElements.push(<ul key={`ul-end-${index}`} className="ml-5 list-disc text-gray-600">{currentList}</ul>);
        isUnorderedList = false;
        currentList = [];
      }
  
      // Convert normal text into paragraphs
      formattedElements.push(
        <p key={index} className="text-gray-700 leading-relaxed mt-2">
          {trimmedLine}
        </p>
      );
    });
  
    // Push any remaining lists at the end
    if (isOrderedList) {
      formattedElements.push(<ol key={`ol-final`} className="ml-5 list-decimal text-gray-600">{currentList}</ol>);
    }
    if (isUnorderedList) {
      formattedElements.push(<ul key={`ul-final`} className="ml-5 list-disc text-gray-600">{currentList}</ul>);
    }
  
    return formattedElements;
  };

export default formatText;  