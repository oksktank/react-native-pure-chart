import { act, renderHook } from '@testing-library/react-native';
import { useSelection } from '../useSelection';

describe('useSelection (uncontrolled)', () => {
  it('starts at null, set updates, set(null) clears', async () => {
    const { result } = await renderHook(() => useSelection(undefined));
    expect(result.current[0]).toBeNull();

    await act(() => {
      result.current[1](2);
    });
    expect(result.current[0]).toBe(2);

    await act(() => {
      result.current[1](null);
    });
    expect(result.current[0]).toBeNull();
  });

  it('onChange observes every set', async () => {
    const onChange = jest.fn();
    const { result } = await renderHook(() => useSelection(undefined, onChange));

    await act(() => {
      result.current[1](1);
    });
    await act(() => {
      result.current[1](null);
    });
    expect(onChange.mock.calls).toEqual([[1], [null]]);
  });
});

describe('useSelection (controlled)', () => {
  it('mirrors the prop and set() does not change the value', async () => {
    const { result, rerender } = await renderHook(
      ({ value }: { value: number | null }) => useSelection(value),
      { initialProps: { value: 3 } }
    );
    expect(result.current[0]).toBe(3);

    await act(() => {
      result.current[1](7);
    });
    expect(result.current[0]).toBe(3);

    await rerender({ value: 5 });
    expect(result.current[0]).toBe(5);
  });

  it('set() still forwards to onChange', async () => {
    const onChange = jest.fn();
    const { result } = await renderHook(() => useSelection(3, onChange));

    await act(() => {
      result.current[1](7);
    });
    expect(onChange).toHaveBeenCalledWith(7);
  });

  it('controlled null is controlled (distinct from undefined)', async () => {
    const { result } = await renderHook(() => useSelection(null));
    await act(() => {
      result.current[1](4);
    });
    // Prop value null keeps winning — internal state is ignored.
    expect(result.current[0]).toBeNull();
  });
});
