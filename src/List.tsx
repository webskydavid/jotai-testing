import './styles.css';
import { atom, Provider, useAtom } from 'jotai';
import { FC, useEffect } from 'react';

interface Node {
  key: string;
  name: string;
  children: Node[];
}

const initVals = [
  {
    key: '1625121488850',
    name: 'Asset',
    children: [
      {
        key: '1625121488851',
        name: 'Some obj',
        children: []
      },
      {
        key: '1625121488852',
        name: 'New Obj',
        children: []
      }
    ]
  },
  { key: '1625121488854', name: 'Another obj', children: [] }
];

const responseAtom = atom([]);
const loadingAtom = atom(true);

const initAtom = atom(null, (get, set) => {
  const run = async () => {
    set(loadingAtom, true);
    await new Promise((res) => setTimeout(() => res(true), 1000));
    console.log('run');
    const treeData = (nodes) => {
      return nodes.map((t) => {
        return atom({ ...t, children: treeData(t.children) });
      });
    };
    set(responseAtom, treeData(initVals));
    set(loadingAtom, false);
  };
  run();
});

const selectedAtom = atom(null);

const Child: FC<{ a: any; onClick: any; handleAdd: any }> = ({
  a,
  onClick,
  handleAdd
}) => {
  const [child] = useAtom<Node>(a);
  const [selected, setSelected] = useAtom(selectedAtom);

  const add = () => {
    setSelected(a);
  };

  // const change = () => {
  //   setChild((prev) => {
  //     console.log('prev', prev);

  //     return { ...prev, name: 'fjheijfeifje' };
  //   });
  // };

  console.log('70', child);

  return (
    <>
      <div
        style={{
          cursor: 'pointer',
          padding: '4px 6px',
          marginBottom: 5
        }}
        onClick={add}
        // onDoubleClick={change}
      >
        <div
          style={{ borderLeft: selected === a ? '10px solid gray' : '1px solid gray' }}
        >
          {child.name}
          <button onClick={() => onClick(child)}>DEL</button>
        </div>
      </div>
      <div style={{ paddingLeft: 20 }}>
        {child?.children?.map((a) => (
          <Child key={`${a}`} a={a} onClick={() => {}} handleAdd={() => {}} />
        ))}
      </div>
    </>
  );
};

const Children: FC<{ data: any }> = ({ data }) => {
  const [children, setChildren] = useAtom<Node[]>(data);
  const [selected] = useAtom(selectedAtom);
  const [, setSelected] = useAtom(selected || atom({}));

  // const handleDel = (node: any) => {
  //   console.log('del', node);
  //   setD((prev: Node[]) => prev.filter((p) => p.key !== node.key));
  // };

  // const handleAdd = () => {
  //   console.log('test');
  //   setChildren((prev) => [
  //     ...prev,
  //     { key: Date.now().toString(), name: 'New atom', children: [] }
  //   ]);
  // };

  const handleAdd = (type: string) => {
    console.log(111, selected);

    if (selected) {
      setSelected((p) => {
        console.log('125', p);

        return {
          ...p,
          children: [
            ...p.children,
            atom({ key: Date.now().toString(), name: type, children: [] })
          ]
        };
      });
    } else {
      setChildren((p) => {
        console.log('125', p);

        return [...p, atom({ key: Date.now().toString(), name: type, children: [] })];
      });
    }
  };

  return (
    <div>
      <button onClick={() => handleAdd('light')}>Light</button>
      <button onClick={() => handleAdd('object')}>Object</button>
      <button onClick={() => handleAdd('video')}>Video</button>
      <hr />
      {children.map((node, index) => {
        return <Child key={index} a={node} onClick={() => {}} handleAdd={() => {}} />;
      })}
    </div>
  );
};

const ListWrapper = () => {
  const [, getData] = useAtom(initAtom);
  const [loading] = useAtom(loadingAtom);

  useEffect(() => {
    getData();
  }, [getData]);

  return (
    <div>
      Wrapper
      {!loading ? <Children data={responseAtom} /> : null}
    </div>
  );
};

export default function List() {
  return (
    <Provider>
      <h3>Dynamic adding atom List</h3>
      <ListWrapper />
    </Provider>
  );
}
