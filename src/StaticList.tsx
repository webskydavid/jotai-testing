import { atom, PrimitiveAtom, useAtom, Provider, Atom } from 'jotai';
import { FC, useCallback } from 'react';

interface Node {
  key: string;
  name: string;
  children: Node[] | PrimitiveAtom<Node>[];
}

const listAtom = atom<Atom<Node>[]>([
  atom<Node>({
    key: '1625121488850',
    name: 'Asset',
    children: [
      atom<Node>({
        key: '1625121488851',
        name: 'Some obj',
        children: []
      }),
      atom<Node>({
        key: '1625121488852',
        name: 'New Obj',
        children: []
      })
    ]
  }),
  atom<Node>({ key: '1625121488854', name: 'Another obj', children: [] })
]);

const selectedAtom = atom<Atom<Node | undefined>>(atom(undefined));

const StaticChild: FC<{ a: Atom<Node> }> = ({ a }) => {
  const [child] = useAtom(a);
  const [selected, setSelected] = useAtom(selectedAtom);

  return (
    <>
      <div style={{ borderLeft: a === selected ? '10px solid green' : '' }}>
        {child.key} {`${a}`} selected: {`${selected}`}
        {/* <button onClick={handleAdd}>Add</button> */}
        <button onClick={() => setSelected(a)}>Select</button>
      </div>
      <div style={{ paddingLeft: 20 }}>
        {child?.children?.map((a) => (
          <StaticChild key={`${a}`} a={a} />
        ))}
      </div>
    </>
  );
};

// const lAtom = atom<Atom<Node>[]>([
//   atom({ key: '1625146094620', name: 'atom!!', children: [] })
// ]);

const List = () => {
  const [list, setList] = useAtom(listAtom);
  const [selAtom] = useAtom<Atom<Node | undefined>>(selectedAtom);
  const [selected, setSelected] = useAtom(selAtom);

  const handleAdd = useCallback(() => {
    console.log(1);

    if (selected) {
      setSelected((p: Node) => {
        console.log('p', p);
        return {
          ...p,
          children: [
            ...p.children,
            atom({ key: Date.now().toString(), name: 'fjweofjeo', children: [] })
          ]
        };
      });
    } else {
      setList((p) => {
        return [...p, atom({ key: Date.now().toString(), name: 'ffwfwe', children: [] })];
      });
    }
  }, [setList, selected, setSelected]);

  console.log(list);

  return (
    <div>
      {console.log('render')}
      <h3>Static list</h3>
      <button onClick={() => handleAdd()}>Add</button>
      {list.length ? list.map((a) => <StaticChild a={a} key={`${a}`} />) : null}
    </div>
  );
};

const StaticList = () => {
  return (
    <div>
      <Provider>
        <List />
      </Provider>
    </div>
  );
};

export default StaticList;
