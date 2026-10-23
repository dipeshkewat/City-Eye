import time
from ultralytics import YOLO

def test_accuracy():
    print("==================================================================")
    print("[*] TESTING ACCURACY OF CITYEYE YOLOv8 MODEL: ml/models/best.pt")
    print("==================================================================")
    
    model = YOLO("ml/models/best.pt")
    print(f"[*] Detected Classes: {model.names}")
    
    t0 = time.time()
    # Run validation on the cityeye_full_optimized validation set
    metrics = model.val(
        data="ml/datasets/cityeye_full_optimized/data.yaml",
        split="val",
        batch=16,
        imgsz=640,
        device="cpu",
        plots=False,
        verbose=True
    )
    t1 = time.time()
    
    mp = metrics.box.mp * 100
    mr = metrics.box.mr * 100
    map50 = metrics.box.map50 * 100
    map_all = metrics.box.map * 100
    
    print("\n" + "="*60)
    print("               CITYEYE ACCURACY VALIDATION RESULTS                ")
    print("="*60)
    print(f"Overall Precision (Detection Accuracy): {mp:.2f}%")
    print(f"Overall Recall (Detection Coverage):    {mr:.2f}%")
    print(f"Overall mAP@50 Benchmark:               {map50:.2f}%")
    print(f"Overall mAP@50-95 (Strict Metric):      {map_all:.2f}%")
    print("-" * 60)
    
    class_map50 = metrics.box.maps * 100 if hasattr(metrics.box, 'maps') and len(metrics.box.maps) > 0 else []
    for idx, name in model.names.items():
        if idx < len(class_map50):
            print(f"  • {name.capitalize():<15} : mAP@50 = {class_map50[idx]:.2f}%")
    
    print("-" * 60)
    print(f"Total Validation Time: {t1 - t0:.1f}s across {metrics.nt_per_class.sum() if hasattr(metrics, 'nt_per_class') else 'all'} target instances.")
    print("="*60)

if __name__ == "__main__":
    test_accuracy()
