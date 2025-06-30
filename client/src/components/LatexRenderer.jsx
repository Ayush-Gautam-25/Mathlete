import katex from 'katex';
import 'katex/dist/katex.min.css';
import { useEffect, useRef } from 'react';

const LatexRenderer = ({ latex }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      katex.render(latex, ref.current, {
        throwOnError: false,
        displayMode: true,
      });
    }
  }, [latex]);

  return <div ref={ref} style={{ width: 'fit-content', }}></div>;
};

export default LatexRenderer;
