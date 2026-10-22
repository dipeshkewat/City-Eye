"""
CityEye Model Training / Fine-Tuning Script.
Fine-tunes YOLOv8 Nano on curated road defect datasets according to
CityEye Technical Specification Section 2 and Section 5.
"""
import os
import shutil
import argparse
import torch
from ultralytics import YOLO

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, "..", ".."))

DATASET_CONFIGS = {
    "road_damage": os.path.join(CURRENT_DIR, "config.yaml"),
    "potholes": os.path.join(PROJECT_ROOT, "ml", "datasets", "potholes", "data.yaml"),
}

def train_model(
    epochs: int = 30,
    imgsz: int = 640,
    batch_size: int = 16,
    dataset_name: str = "road_damage",
    base_model: str = "yolov8n.pt"
):
    current_dir = CURRENT_DIR
    data_yaml = DATASET_CONFIGS.get(dataset_name, DATASET_CONFIGS["road_damage"])
    device = "cuda:0" if torch.cuda.is_available() else "cpu"

    print(f"=======================================================")
    print(f"[*] STARTING CITYEYE YOLOv8 MODEL ACCURACY TRAINING")
    print(f"[*] Dataset:         {dataset_name} ({data_yaml})")
    print(f"[*] Base Weights:    {base_model}")
    print(f"[*] Target Epochs:   {epochs}")
    print(f"[*] Batch Size:      {batch_size}")
    print(f"[*] Image Resolution: {imgsz}px")
    print(f"[*] Compute Device:  {device}")
    print(f"=======================================================\n")

    model = YOLO(base_model)
    results = model.train(
        data=data_yaml,
        epochs=epochs,
        imgsz=imgsz,
        batch=batch_size,
        device=device,
        workers=4 if device == "cpu" else 8,
        project=os.path.join(current_dir, "runs"),
        name="cityeye_trained_model",
        exist_ok=True
    )

    run_best = os.path.join(current_dir, "runs", "cityeye_trained_model", "weights", "best.pt")
    target_weights = os.path.abspath(os.path.join(current_dir, "..", "models", "best.pt"))
    backup_weights = os.path.abspath(os.path.join(current_dir, "..", "models", "best_backup_baseline.pt"))

    if os.path.exists(target_weights) and not os.path.exists(backup_weights):
        shutil.copy(target_weights, backup_weights)
        print(f"[*] Backed up baseline model weights to: {backup_weights}")

    if os.path.exists(run_best):
        shutil.copy(run_best, target_weights)
        print(f"\n[OK] Deployed newly trained high-accuracy model weights to: {target_weights}")

    print("\n[OK] TRAINING PIPELINE COMPLETE!")
    return results

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train CityEye YOLOv8 Model")
    parser.add_argument("--epochs", type=int, default=30, help="Number of training epochs")
    parser.add_argument("--batch", type=int, default=16, help="Batch size")
    parser.add_argument("--imgsz", type=int, default=640, help="Image resolution for training")
    parser.add_argument("--dataset", type=str, default="road_damage", choices=["road_damage", "potholes"], help="Target dataset")
    args = parser.parse_args()

    train_model(epochs=args.epochs, batch_size=args.batch, imgsz=args.imgsz, dataset_name=args.dataset)

