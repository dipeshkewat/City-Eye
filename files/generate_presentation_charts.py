"""
CityEye Academic Presentation Chart Generator (Updated with New Tested Validation Results)
Generates high-resolution (300 DPI) professional graphs for college PPT slides:
1. model_accuracy_progression.png
2. per_class_accuracy_breakdown.png
3. before_after_model_comparison.png
4. pipeline_performance_summary.png
"""

import os
import matplotlib.pyplot as plt
import numpy as np

OUTPUT_DIR = r"F:\Projects\CITYEYE-Dipesh\files\presentation_charts"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Set high-quality visual style
plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
plt.rcParams['font.sans-serif'] = 'Arial'
plt.rcParams['font.family'] = 'sans-serif'

# -----------------------------------------------------------------------------
# GRAPH 1: MODEL ACCURACY PROGRESSION (Baseline vs PC Run vs Colab vs Final)
# -----------------------------------------------------------------------------
def generate_progression_chart():
    fig, ax = plt.subplots(figsize=(11, 6), dpi=300)
    
    stages = [
        '1. Baseline\n(Unfine-tuned)',
        '2. PC Prototype\n(Potholes Only)',
        '3. Multi-Class\n(Initial Run)',
        '4. CityEye Final\n(Optimized Model)'
    ]
    
    precision = [2.9, 40.1, 67.6, 73.7]
    recall = [19.2, 24.8, 49.7, 57.7]
    map50 = [1.4, 26.2, 55.5, 64.9]
    
    x = np.arange(len(stages))
    width = 0.25
    
    rects1 = ax.bar(x - width, precision, width, label='Precision (%)', color='#2563EB', edgecolor='black', linewidth=0.8)
    rects2 = ax.bar(x, recall, width, label='Recall (%)', color='#0D9488', edgecolor='black', linewidth=0.8)
    rects3 = ax.bar(x + width, map50, width, label='mAP@50 (%)', color='#F59E0B', edgecolor='black', linewidth=0.8)
    
    ax.set_ylabel('Metric Score (%)', fontsize=12, fontweight='bold', labelpad=10)
    ax.set_title('CityEye YOLOv8 Model Accuracy Progression Across Iterations', fontsize=15, fontweight='bold', pad=15)
    ax.set_xticks(x)
    ax.set_xticklabels(stages, fontsize=11, fontweight='medium')
    ax.set_ylim(0, 90)
    ax.legend(frameon=True, facecolor='white', framealpha=0.95, fontsize=11, loc='upper left')
    
    for rects in [rects1, rects2, rects3]:
        for rect in rects:
            h = rect.get_height()
            ax.annotate(f'{h:.1f}%',
                        xy=(rect.get_x() + rect.get_width() / 2, h),
                        xytext=(0, 4),
                        textcoords="offset points",
                        ha='center', va='bottom', fontsize=10, fontweight='bold')
            
    plt.tight_layout()
    out_path = os.path.join(OUTPUT_DIR, "model_accuracy_progression.png")
    plt.savefig(out_path, dpi=300)
    plt.close()
    print(f"[OK] Generated: {out_path}")

# -----------------------------------------------------------------------------
# GRAPH 2: PER-CLASS DETECTION ACCURACY BREAKDOWN (NEW VALIDATION DATA)
# -----------------------------------------------------------------------------
def generate_per_class_chart():
    fig, ax = plt.subplots(figsize=(10, 6), dpi=300)
    
    classes = ['Potholes & Cracks\n(Road Hazards)', 'Municipal Waste\n(Illegal Dumps)', 'Waterlogging\n(Street Flooding)']
    precision = [71.2, 72.0, 77.8]
    recall = [59.0, 60.4, 53.6]
    map50 = [64.7, 67.8, 62.2]
    
    x = np.arange(len(classes))
    width = 0.25
    
    rects1 = ax.bar(x - width, precision, width, label='Precision (%)', color='#4F46E5', edgecolor='black', linewidth=0.8)
    rects2 = ax.bar(x, recall, width, label='Recall (%)', color='#10B981', edgecolor='black', linewidth=0.8)
    rects3 = ax.bar(x + width, map50, width, label='mAP@50 (%)', color='#EC4899', edgecolor='black', linewidth=0.8)
    
    ax.set_ylabel('Metric Score (%)', fontsize=12, fontweight='bold', labelpad=10)
    ax.set_title('Per-Category Performance Breakdown: CityEye YOLOv8 Model', fontsize=15, fontweight='bold', pad=15)
    ax.set_xticks(x)
    ax.set_xticklabels(classes, fontsize=11, fontweight='bold')
    ax.set_ylim(0, 95)
    ax.legend(frameon=True, facecolor='white', framealpha=0.95, fontsize=11, loc='upper right')
    
    for rects in [rects1, rects2, rects3]:
        for rect in rects:
            h = rect.get_height()
            ax.annotate(f'{h:.1f}%',
                        xy=(rect.get_x() + rect.get_width() / 2, h),
                        xytext=(0, 4),
                        textcoords="offset points",
                        ha='center', va='bottom', fontsize=10, fontweight='bold')
            
    plt.tight_layout()
    out_path = os.path.join(OUTPUT_DIR, "per_class_accuracy_breakdown.png")
    plt.savefig(out_path, dpi=300)
    plt.close()
    print(f"[OK] Generated: {out_path}")

# -----------------------------------------------------------------------------
# GRAPH 3: DIRECT BEFORE VS AFTER COMPARISON
# -----------------------------------------------------------------------------
def generate_before_after_chart():
    fig, ax = plt.subplots(figsize=(10, 6), dpi=300)
    
    metrics = ['mAP@50 (Benchmark)', 'Overall Precision', 'Overall Recall', 'Pothole Precision', 'Strict mAP@50-95']
    before = [55.5, 67.6, 49.7, 58.3, 32.0]
    after = [64.9, 73.7, 57.7, 71.2, 40.1]
    
    y = np.arange(len(metrics))
    height = 0.35
    
    rects1 = ax.barh(y - height/2, before, height, label='Previous Model Run', color='#94A3B8', edgecolor='black', linewidth=0.8)
    rects2 = ax.barh(y + height/2, after, height, label='New Optimized Model (Current)', color='#059669', edgecolor='black', linewidth=0.8)
    
    ax.set_xlabel('Score Percentage (%)', fontsize=12, fontweight='bold', labelpad=10)
    ax.set_title('Model Optimization: Before vs. After Comparison', fontsize=15, fontweight='bold', pad=15)
    ax.set_yticks(y)
    ax.set_yticklabels(metrics, fontsize=11, fontweight='bold')
    ax.set_xlim(0, 88)
    ax.legend(frameon=True, facecolor='white', framealpha=0.95, fontsize=11, loc='lower right')
    
    # Add labels and delta
    for i in range(len(metrics)):
        b = before[i]
        a = after[i]
        delta = a - b
        ax.annotate(f'{b:.1f}%', xy=(b, y[i] - height/2), xytext=(4, -3), textcoords="offset points", fontsize=9, fontweight='medium', va='center')
        ax.annotate(f'{a:.1f}%  (+{delta:.1f}%)', xy=(a, y[i] + height/2), xytext=(4, 0), textcoords="offset points", fontsize=9, fontweight='bold', color='#047857', va='center')
    
    plt.tight_layout()
    out_path = os.path.join(OUTPUT_DIR, "before_after_model_comparison.png")
    plt.savefig(out_path, dpi=300)
    plt.close()
    print(f"[OK] Generated: {out_path}")

# -----------------------------------------------------------------------------
# GRAPH 4: SYSTEM EVALUATION & DATASET BREAKDOWN DASHBOARD
# -----------------------------------------------------------------------------
def generate_summary_dashboard():
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(13, 5.5), dpi=300)
    
    # Subplot 1: Dataset Volume Contribution (Pie)
    categories = ['Potholes & Road Cracks\n(1,790 instances)', 
                  'Municipal Waste & Garbage\n(9,488 instances)', 
                  'Waterlogging & Street Floods\n(1,953 instances)']
    counts = [1790, 9488, 1953]
    colors = ['#3B82F6', '#10B981', '#06B6D4']
    explode = (0.05, 0.05, 0.05)
    
    wedges, texts, autotexts = ax1.pie(counts, labels=categories, autopct='%1.1f%%',
                                      startangle=140, colors=colors, explode=explode,
                                      textprops={'fontsize': 10, 'weight': 'bold'})
    for at in autotexts:
        at.set_color('white')
        at.set_fontsize(11)
    ax1.set_title('Dataset Annotation Distribution (Total: 13,231 Instances)', fontsize=13, fontweight='bold', pad=10)
    
    # Subplot 2: Inference Latency (GPU Real-time vs CPU)
    pipeline_steps = ['CLAHE Contrast\nEnhancement', 'Multi-Frame IoU\nTracking', 'GPU Inference\n(T4 / Edge)', 'CPU Inference\n(Local Laptop)']
    latencies = [1.4, 0.8, 28.0, 107.3]
    bar_colors = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B']
    
    bars = ax2.barh(pipeline_steps, latencies, color=bar_colors, edgecolor='black', linewidth=0.8, height=0.5)
    ax2.set_xlabel('Latency per Video Frame (Milliseconds)', fontsize=11, fontweight='bold')
    ax2.set_title('Pipeline Latency: Real-Time Edge Processing (>35 FPS on GPU)', fontsize=13, fontweight='bold', pad=10)
    ax2.set_xlim(0, 130)
    
    for bar in bars:
        w = bar.get_width()
        ax2.annotate(f'{w:.1f} ms',
                    xy=(w, bar.get_y() + bar.get_height() / 2),
                    xytext=(5, 0),
                    textcoords="offset points",
                    ha='left', va='center', fontsize=10, fontweight='bold')
        
    plt.tight_layout()
    out_path = os.path.join(OUTPUT_DIR, "pipeline_performance_summary.png")
    plt.savefig(out_path, dpi=300)
    plt.close()
    print(f"[OK] Generated: {out_path}")

if __name__ == "__main__":
    generate_progression_chart()
    generate_per_class_chart()
    generate_before_after_chart()
    generate_summary_dashboard()
    print("\nAll 4 presentation charts successfully generated in 300 DPI!")
