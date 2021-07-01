import './styles.css';
import { atom, Provider, useAtom, PrimitiveAtom, WritableAtom } from 'jotai';
import { selectAtom, splitAtom } from 'jotai/utils';
import { FC, useEffect, useMemo } from 'react';

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

const responseAtom = atom<Node[]>([]);

const initAtom = atom(null, (get, set) => {
  const run = async () => {
    await new Promise((res) => setTimeout(() => res(true), 1000));
    console.log('run');
    set(responseAtom, initVals);
  };
  run();
});

const selectedAtom = atom(null);
const itemToAddAtom = atom(null);

const Child: FC<{ a: Node; onClick: any; handleAdd: any }> = ({
  a,
  onClick,
  handleAdd
}) => {
  const memAtom = useMemo(() => atom(a), [a]);
  const [item, setItem] = useAtom<Node>(memAtom);
  const [selected, setSelected] = useAtom(selectedAtom);

  const change = () => {
    setItem((prev) => {
      console.log('prev', prev);

      return { ...prev, name: 'fjheijfeifje' };
    });
  };

  return (
    <div
      style={{
        cursor: 'pointer',
        padding: '4px 6px',
        borderLeft: selected?.key === item.key ? '10px solid gray' : '1px solid gray',
        marginBottom: 5
      }}
      onClick={() => setSelected(item)}
      onDoubleClick={change}
    >
      {item.name} {`${memAtom}`}
      <button onClick={() => onClick(item)}>DEL</button>
    </div>
  );
};

const Children: FC<{ data: any }> = ({ data }) => {
  const memoList = useMemo(() => atom(data), [data]);
  const [d, setD] = useAtom(memoList);
  const [selected, setSelected] = useAtom(selectedAtom);

  const handleDel = (node: any) => {
    console.log('del', node);
    setD((prev: Node[]) => prev.filter((p) => p.key !== node.key));
  };

  const handleAdd = () => {
    console.log('test');
    setD((prev) => [
      ...prev,
      { key: Date.now().toString(), name: 'New atom', children: [] }
    ]);
  };

  return (
    <div style={{ paddingLeft: 20 }}>
      {d.map((node, index) => {
        if (node.children.length === 0) {
          return <Child key={index} a={node} onClick={handleDel} handleAdd={handleAdd} />;
        }

        return <Children key={index} data={node.children} />;
      })}
    </div>
  );
};

const ListWrapper = () => {
  const [list, add] = useAtom(responseAtom);
  //const [list, remove] = useAtom(splitAtom<Node, unknown>(responseAtom));
  const [, getData] = useAtom(initAtom);
  const [toAdd, setToAdd] = useAtom(itemToAddAtom);
  const [selected, setSelected] = useAtom(selectedAtom);

  useEffect(() => {
    getData();
  }, [getData]);

  const handleAdd = (type: string) => {
    // add((prev) => [
    //   ...prev,
    //   { key: Date.now().toString(), name: 'fjeifjei', children: [] }
    // ]);

    setToAdd({ key: Date.now().toString(), name: type, children: [] });
    if (selected) {
      setSelected((prev) => {
        console.log(prev);
        return {
          ...prev,
          children: [...prev.children, selected]
        };
      });
    }
  };

  return (
    <div>
      <button onClick={() => handleAdd('light')}>Light</button>
      <button onClick={() => handleAdd('object')}>Object</button>
      <button onClick={() => handleAdd('video')}>Video</button>
      <hr />
      Wrapper
      {/* {list.map((i, index) => (
        <Child a={i} key={index} onClick={() => {}} />
      ))} */}
      <Children data={list} />
    </div>
  );
};

export default function List() {
  return (
    <Provider>
      <h4>List</h4>
      <ListWrapper />
    </Provider>
  );
}
