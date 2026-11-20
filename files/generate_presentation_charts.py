"""
CityEye Academic Presentation & Project Report Chart Generator
Generates publication-quality, 300 DPI graphs incorporating the new YOLOv8-Medium model results:
1. model_accuracy_progression.png       -> Complete model evolution across project milestones
2. yolov8_small_vs_medium_comparison.png -> Direct engineering comparison of YOLOv8s vs YOLOv8m
3. per_class_performance_breakdown.png  -> Class-by-class performance (Pothole, Garbage, Waterlogging)
4. system_pipeline_architecture.png     -> Dataset distribution and real-time processing latency
"""

import os
import matplotlib.pyplot as plt
import numpy as np

OUTPUT_DIR = r"F:\Projects\CITYEYE-Dipesh\files\presentation_charts"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Styling configuration
plt.rcParams['font.sans-serif'] = 'Segoe UI', 'DejaVu Sans', 'Arial'
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['axes.edgecolor'] = '#CBD5E1'
plt.rcParams['axes.linewidth'] = 1.0

# -----------------------------------------------------------------------------
# GRAPH 1: MODEL ACCURACY PROGRESSION (Milestone Evolution)
# -----------------------------------------------------------------------------
def generate_progression_chart():
    fig, ax = plt.subplots(figsize=(11, 6), dpi=300)
    fig.patch.set_facecolor('#FFFFFF')
    ax.set_facecolor('#F8FAFC')
    
    stages = [
        'Phase 1: Baseline\n(Pretrained COCO)',
        'Phase 2: Prototype\n(Single-Class Pothole)',
        'Phase 3: YOLOv8s\n(8,196 Images)',
        'Phase 4: CITYEYE YOLOv8m\n(11,000 Curated + Augs)'
    ]
    
    precision = [2.9, 40.1, 74.6, 71.7]
    recall = [19.2, 24.8, 57.1, 60.7]
    map50 = [1.4, 26.2, 64.9, 67.5]
    map50_95 = [0.6, 12.4, 40.2, 44.8]
    
    x = np.arange(len(stages))
    width = 0.20
    
    rects1 = ax.bar(x - 1.5*width, precision, width, label='Precision (%)', color='#2563EB', edgecolor='#1D4ED8', linewidth=1)
    rects2 = ax.bar(x - 0.5*width, recall, width, label='Recall / Coverage (%)', color='#0D9488', edgecolor='#0F766E', linewidth=1)
    rects3 = ax.bar(x + 0.5*width, map50, width, label='mAP@50 (%)', color='#F59E0B', edgecolor='#D97706', linewidth=1)
    rects4 = ax.bar(x + 1.5*width, map50_95, width, label='Strict mAP@50-95 (%)', color='#8B5CF6', edgecolor='#7C3AED', linewidth=1)
    
    ax.set_ylabel('Performance Metric Score (%)', fontsize=12, fontweight='bold', color='#0F172A', labelpad=10)
    ax.set_title('CITYEYE: Multi-Stage Computer Vision Model Performance Progression', fontsize=14, fontweight='bold', color='#0F172A', pad=16)
    ax.set_xticks(x)
    ax.set_xticklabels(stages, fontsize=10.5, fontweight='bold', color='#1E293B')
    ax.set_ylim(0, 92)
    ax.grid(axis='y', linestyle='--', alpha=0.6, color='#E2E8F0')
    ax.legend(frameon=True, facecolor='white', edgecolor='#CBD5E1', fontsize=10, loc='upper left')
    
    for rects in [rects1, rects2, rects3, rects4]:
        for rect in rects:
            h = rect.get_height()
            ax.annotate(f'{h:.1f}%',
                        xy=(rect.get_x() + rect.get_width() / 2, h),
                        xytext=(0, 4),
                        textcoords="offset points",
                        ha='center', va='bottom', fontsize=8.5, fontweight='bold', color='#0F172A')
            
    plt.tight_layout()
    out_path = os.path.join(OUTPUT_DIR, "model_accuracy_progression.png")
    plt.savefig(out_path, dpi=300)
    plt.close()
    print(f"[✔] Generated: {out_path}")

# -----------------------------------------------------------------------------
# GRAPH 2: DIRECT ENGINEERING COMPARISON (YOLOv8-Small vs YOLOv8-Medium)
# -----------------------------------------------------------------------------
def generate_before_after_chart():
    fig, ax = plt.subplots(figsize=(10.5, 6), dpi=300)
    fig.patch.set_facecolor('#FFFFFF')
    ax.set_facecolor('#F8FAFC')
    
    metrics = [
        'Strict mAP@50-95 (Localization)',
        'Defect Recall (Miss Reduction)',
        'Overall mAP@50 (Benchmark)',
        'Model Parameters (Millions)',
        'Bounding Box Loss (Lower is Better)',
        'Class Error Loss (Lower is Better)'
    ]
    
    # Standardized comparison metrics
    small_vals = [40.2, 57.1, 64.9, 11.1, 12.7, 12.0]
    medium_vals = [44.8, 60.7, 67.5, 25.9, 11.4, 11.1]
    
    y = np.arange(len(metrics))
    height = 0.35
    
    rects1 = ax.barh(y - height/2, small_vals, height, label='Previous Model (YOLOv8-Small, 8.1k)', color='#94A3B8', edgecolor='#64748B', linewidth=0.8)
    rects2 = ax.barh(y + height/2, medium_vals, height, label='New Trained Model (YOLOv8-Medium, 11k Curated)', color='#059669', edgecolor='#047857', linewidth=0.8)
    
    ax.set_xlabel('Score / Value (Percentage or Loss × 10)', fontsize=11.5, fontweight='bold', color='#0F172A', labelpad=10)
    ax.set_title('Architecture Upgrade: YOLOv8-Small vs. YOLOv8-Medium Engineering Impact', fontsize=14, fontweight='bold', color='#0F172A', pad=15)
    ax.set_yticks(y)
    ax.set_yticklabels(metrics, fontsize=10.5, fontweight='bold', color='#1E293B')
    ax.set_xlim(0, 85)
    ax.grid(axis='x', linestyle='--', alpha=0.6, color='#E2E8F0')
    ax.legend(frameon=True, facecolor='white', edgecolor='#CBD5E1', fontsize=10, loc='lower right')
    
    # Deltas
    for i in range(len(metrics)):
        s = small_vals[i]
        m = medium_vals[i]
        delta = m - s
        ax.annotate(f'{s:.1f}', xy=(s, y[i] - height/2), xytext=(4, 0), textcoords="offset points", fontsize=9, va='center', color='#475569')
        if 'Loss' in metrics[i]:
            diff_str = f"{m:.1f}  (-{abs(delta):.1f} loss)"
            color = '#047857'
        else:
            diff_str = f"{m:.1f}  (+{delta:.1f})"
            color = '#047857'
        ax.annotate(diff_str, xy=(m, y[i] + height/2), xytext=(4, 0), textcoords="offset points", fontsize=9.5, fontweight='bold', color=color, va='center')
        
    plt.tight_layout()
    out_path = os.path.join(OUTPUT_DIR, "yolov8_small_vs_medium_comparison.png")
    plt.savefig(out_path, dpi=300)
    plt.close()
    print(f"[✔] Generated: {out_path}")

# -----------------------------------------------------------------------------
# GRAPH 3: PER-CLASS DETECTION ACCURACY BREAKDOWN
# -----------------------------------------------------------------------------
def generate_per_class_chart():
    fig, ax = plt.subplots(figsize=(10, 5.8), dpi=300)
    fig.patch.set_facecolor('#FFFFFF')
    ax.set_facecolor('#F8FAFC')
    
    classes = [
        'Potholes & Asphalt Cracks\n(Road Hazards / PWD)',
        'Municipal Solid Waste\n(Illegal Dumps / SWMD)',
        'Street Waterlogging\n(Flooded Curbs / Drainage)'
    ]
    precision = [72.4, 71.8, 70.8]
    recall = [61.8, 62.1, 58.2]
    map50 = [68.2, 68.9, 65.4]
    
    x = np.arange(len(classes))
    width = 0.25
    
    rects1 = ax.bar(x - width, precision, width, label='Precision (%)', color='#3B82F6', edgecolor='#1D4ED8', linewidth=1)
    rects2 = ax.bar(x, recall, width, label='Recall (%)', color='#10B981', edgecolor='#047857', linewidth=1)
    rects3 = ax.bar(x + width, map50, width, label='mAP@50 (%)', color='#EC4899', edgecolor='#BE185D', linewidth=1)
    
    ax.set_ylabel('Metric Score (%)', fontsize=12, fontweight='bold', color='#0F172A', labelpad=10)
    ax.set_title('Per-Class Civic Defect Detection Accuracy (YOLOv8-Medium Model)', fontsize=14, fontweight='bold', color='#0F172A', pad=15)
    ax.set_xticks(x)
    ax.set_xticklabels(classes, fontsize=10.5, fontweight='bold', color='#1E293B')
    ax.set_ylim(0, 90)
    ax.grid(axis='y', linestyle='--', alpha=0.6, color='#E2E8F0')
    ax.legend(frameon=True, facecolor='white', edgecolor='#CBD5E1', fontsize=10.5, loc='upper right')
    
    for rects in [rects1, rects2, rects3]:
        for rect in rects:
            h = rect.get_height()
            ax.annotate(f'{h:.1f}%',
                        xy=(rect.get_x() + rect.get_width() / 2, h),
                        xytext=(0, 4),
                        textcoords="offset points",
                        ha='center', va='bottom', fontsize=9.5, fontweight='bold', color='#0F172A')
            
    plt.tight_layout()
    out_path = os.path.join(OUTPUT_DIR, "per_class_performance_breakdown.png")
    plt.savefig(out_path, dpi=300)
    plt.close()
    print(f"[✔] Generated: {out_path}")

# -----------------------------------------------------------------------------
# GRAPH 4: SYSTEM PIPELINE, DATASET DISTRIBUTION & LATENCY DASHBOARD
# -----------------------------------------------------------------------------
def generate_summary_dashboard():
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(13, 5.5), dpi=300)
    fig.patch.set_facecolor('#FFFFFF')
    
    # Subplot 1: Dataset Distribution (Curated 11,000 Dataset)
    categories = ['Potholes & Cracks\n(4,650 images)', 
                  'Solid Waste & Garbage\n(3,850 images)', 
                  'Street Waterlogging\n(2,500 images)']
    counts = [4650, 3850, 2500]
    colors = ['#3B82F6', '#10B981', '#06B6D4']
    explode = (0.04, 0.04, 0.04)
    
    wedges, texts, autotexts = ax1.pie(counts, labels=categories, autopct='%1.1f%%',
                                      startangle=140, colors=colors, explode=explode,
                                      textprops={'fontsize': 10, 'weight': 'bold', 'color': '#0F172A'})
    for at in autotexts:
        at.set_color('white')
        at.set_fontsize(11)
        at.set_weight('bold')
    ax1.set_title('Curated Master Dataset Distribution\n(Total: Exactly 11,000 Verified Images)', fontsize=12.5, fontweight='bold', pad=12, color='#0F172A')
    
    # Subplot 2: Inference & Triage Latency (Real-time capable)
    pipeline_steps = [
        'CCTV Frame Preprocessing', 
        'YOLOv8m Neural Inference (GPU)', 
        'Multi-Frame Bounding Box Locator', 
        'Municipal Database & Alert Dispatch',
        'Gemini Multimodal Triage (Async)'
    ]
    latencies = [1.2, 22.4, 1.8, 6.5, 340.0]
    bar_colors = ['#8B5CF6', '#10B981', '#3B82F6', '#F59E0B', '#06B6D4']
    
    ax2.set_facecolor('#F8FAFC')
    bars = ax2.barh(pipeline_steps[:4], latencies[:4], color=bar_colors[:4], edgecolor='#475569', linewidth=0.8, height=0.55)
    ax2.set_xlabel('Latency per Video Frame (Milliseconds)', fontsize=11, fontweight='bold', color='#0F172A')
    ax2.set_title('Real-Time Live Feed Pipeline Latency\n(Total: ~31.9 ms = ~32+ FPS Real-Time Processing)', fontsize=12.5, fontweight='bold', pad=12, color='#0F172A')
    ax2.set_xlim(0, 38)
    ax2.grid(axis='x', linestyle='--', alpha=0.6, color='#E2E8F0')
    
    for bar in bars:
        w = bar.get_width()
        ax2.annotate(f'{w:.1f} ms',
                    xy=(w, bar.get_y() + bar.get_height() / 2),
                    xytext=(6, 0),
                    textcoords="offset points",
                    ha='left', va='center', fontsize=9.5, fontweight='bold', color='#0F172A')
        
    plt.tight_layout()
    out_path = os.path.join(OUTPUT_DIR, "system_pipeline_architecture.png")
    plt.savefig(out_path, dpi=300)
    plt.close()
    print(f"[✔] Generated: {out_path}")

if __name__ == "__main__":
    generate_progression_chart()
    generate_before_after_chart()
    generate_per_class_chart()
    generate_summary_dashboard()
    print("\n[SUCCESS] All 4 presentation charts successfully generated in 300 DPI!")
